const express = require('express');
const router = express.Router();
const Movimentacao = require('../models/Movimentacao');
const Bobina = require('../models/Bobina');
const Papelcartao = require('../models/Papelcartao');

// GET todas as movimentações
router.get('/', async (req, res) => {
  try {
    const movimentacoes = await Movimentacao.find().sort({ data: -1 });
    res.json(movimentacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST criar nova movimentação (uso interno - chamada das rotas de saída/retorno)
router.post('/', async (req, res) => {
  try {
    const novaMovimentacao = new Movimentacao(req.body);
    await novaMovimentacao.save();
    res.status(201).json(novaMovimentacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT — editar uma movimentação ajustando o saldo do item correspondente
// Campos editáveis: quantidade, tipoMaquina, usuario, observacoes, perdaKg
router.put('/:id', async (req, res) => {
  try {
    const mov = await Movimentacao.findById(req.params.id);
    if (!mov) return res.status(404).json({ error: 'Movimentação não encontrada' });

    const quantidadeAntiga = parseFloat(mov.quantidade) || 0;
    const quantidadeNova = req.body.quantidade !== undefined
      ? parseFloat(req.body.quantidade)
      : quantidadeAntiga;
    if (isNaN(quantidadeNova) || quantidadeNova < 0) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }
    const delta = quantidadeNova - quantidadeAntiga;

    // Ajuste no item, se a quantidade mudou
    if (delta !== 0) {
      const tipoItem = mov.tipoItem || 'bobina';
      const idItem = mov.idBobina || mov.idItem;

      if (tipoItem === 'bobina') {
        const bobina = await Bobina.findById(idItem);
        if (!bobina) return res.status(400).json({ error: 'Bobina referenciada não existe mais' });
        // SAIDA: aumentar quantidade da movimentação = retirar mais peso da bobina
        // RETORNO: aumentar quantidade da movimentação = adicionar mais peso de volta
        if (mov.tipoMovimentacao === 'SAIDA') {
          bobina.peso = (bobina.peso || 0) - delta;
          if (bobina.peso < 0) return res.status(400).json({ error: `Bobina ficaria com peso negativo (${bobina.peso})` });
        } else if (mov.tipoMovimentacao === 'RETORNO') {
          bobina.peso = (bobina.peso || 0) + delta;
        }
        await bobina.save();
      } else if (tipoItem === 'papelcartao') {
        const pc = await Papelcartao.findById(idItem);
        if (!pc) return res.status(400).json({ error: 'Papelcartão referenciado não existe mais' });
        if (mov.tipoMovimentacao === 'SAIDA') {
          // Aumentar saída = tirar mais do estoque, colocar mais em uso
          pc.quantidade = (pc.quantidade || 0) - delta;
          pc.quantidadeEmUso = (pc.quantidadeEmUso || 0) + delta;
          if (pc.quantidade < 0) return res.status(400).json({ error: `Papelcartão ficaria com estoque negativo (${pc.quantidade})` });
        } else if (mov.tipoMovimentacao === 'RETORNO') {
          // Aumentar retorno = aumentar estoque (sem mexer no em-uso, pois ele já foi zerado no retorno original)
          pc.quantidade = (pc.quantidade || 0) + delta;
        }
        await pc.save();
      }
    }

    // Aplica os outros campos editáveis
    if (req.body.quantidade !== undefined) mov.quantidade = quantidadeNova;
    if (req.body.tipoMaquina !== undefined) mov.tipoMaquina = req.body.tipoMaquina;
    if (req.body.usuario !== undefined) mov.usuario = req.body.usuario;
    if (req.body.observacoes !== undefined) mov.observacoes = req.body.observacoes;
    if (req.body.perdaKg !== undefined) mov.perdaKg = parseFloat(req.body.perdaKg) || 0;
    await mov.save();

    res.json(mov);
  } catch (err) {
    console.error('Erro ao editar movimentação:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE — exclui movimentação revertendo o efeito no item
router.delete('/:id', async (req, res) => {
  try {
    const mov = await Movimentacao.findById(req.params.id);
    if (!mov) return res.status(404).json({ error: 'Movimentação não encontrada' });

    const quantidade = parseFloat(mov.quantidade) || 0;
    const tipoItem = mov.tipoItem || 'bobina';
    const idItem = mov.idBobina || mov.idItem;

    if (tipoItem === 'bobina') {
      const bobina = await Bobina.findById(idItem);
      if (bobina) {
        if (mov.tipoMovimentacao === 'SAIDA') {
          // Reverte: soma o peso de volta, limpa dataSaida
          bobina.peso = (bobina.peso || 0) + quantidade;
          bobina.dataSaida = null;
          bobina.status = 'DISPONÍVEL';
        } else if (mov.tipoMovimentacao === 'RETORNO') {
          // Reverte: tira o peso, marca como em uso de novo
          bobina.peso = (bobina.peso || 0) - quantidade;
          if (bobina.peso < 0) {
            return res.status(400).json({ error: `Bobina ficaria com peso negativo (${bobina.peso}). Ajuste antes de excluir.` });
          }
          bobina.dataSaida = mov.data || new Date();
          bobina.status = 'EM USO';
        }
        await bobina.save();
      }
    } else if (tipoItem === 'papelcartao') {
      const pc = await Papelcartao.findById(idItem);
      if (pc) {
        if (mov.tipoMovimentacao === 'SAIDA') {
          // Reverte: devolve estoque, tira do em-uso
          pc.quantidade = (pc.quantidade || 0) + quantidade;
          pc.quantidadeEmUso = Math.max(0, (pc.quantidadeEmUso || 0) - quantidade);
          await pc.save();
        } else if (mov.tipoMovimentacao === 'RETORNO') {
          // Bloqueia se gerou folhas filhas (precisariam ser apagadas antes)
          if ((mov.filhasGeradas || 0) > 0) {
            return res.status(400).json({
              error: `Este retorno gerou ${mov.filhasGeradas} folha(s) filha(s). Exclua manualmente as filhas geradas antes de excluir este retorno.`
            });
          }
          // Reverte: tira do estoque, devolve pro em-uso
          pc.quantidade = (pc.quantidade || 0) - quantidade;
          if (pc.quantidade < 0) {
            return res.status(400).json({ error: `Papelcartão ficaria com estoque negativo. Ajuste antes de excluir.` });
          }
          pc.quantidadeEmUso = (pc.quantidadeEmUso || 0) + quantidade;
          await pc.save();
        }
      }
    }

    await Movimentacao.findByIdAndDelete(mov._id);
    res.json({ message: 'Movimentação excluída e saldo ajustado' });
  } catch (err) {
    console.error('Erro ao excluir movimentação:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
