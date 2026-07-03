const express = require('express');
const router = express.Router();
const Papelcartao = require('../models/Papelcartao');
const Movimentacao = require('../models/Movimentacao');

// Gera próximo código sequencial PC-0001, PC-0002...
async function proximoCodigo() {
  const ultimo = await Papelcartao.findOne({ codigo: /^PC-\d+$/ })
    .sort({ codigo: -1 })
    .select('codigo')
    .lean();
  let n = 0;
  if (ultimo && ultimo.codigo) {
    const m = ultimo.codigo.match(/^PC-(\d+)$/);
    if (m) n = parseInt(m[1], 10);
  }
  return `PC-${String(n + 1).padStart(4, '0')}`;
}

router.get('/', async (req, res) => {
  try {
    const itens = await Papelcartao.find().sort({ codigo: 1 });
    res.json(itens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const dados = { ...req.body };
    if (!dados.codigo || !dados.codigo.trim()) {
      dados.codigo = await proximoCodigo();
    }
    const novo = new Papelcartao(dados);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json({ message: 'Registro removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Entrada — incrementa o saldo
router.post('/:id/entrada', async (req, res) => {
  try {
    const qtd = parseInt(req.body.quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    item.quantidade = (item.quantidade || 0) + qtd;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Saída — envia para uso: decrementa saldo e soma em "quantidadeEmUso"
// Aceita: quantidade, tipoMaquina, usuario, observacoes
router.post('/:id/saida', async (req, res) => {
  try {
    const qtd = parseInt(req.body.quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    if (qtd > (item.quantidade || 0)) {
      return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
    }
    item.quantidade = (item.quantidade || 0) - qtd;
    item.quantidadeEmUso = (item.quantidadeEmUso || 0) + qtd;
    item.maquinaAtual = req.body.tipoMaquina || '';
    // metadados da última saída (opcional)
    item.ultimaSaida = {
      data: new Date(),
      quantidade: qtd,
      tipoMaquina: req.body.tipoMaquina || '',
      usuario: req.body.usuario || '',
      observacoes: req.body.observacoes || ''
    };
    await item.save();

    // Grava no histórico de movimentações
    try {
      await new Movimentacao({
        tipoItem: 'papelcartao',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: `${item.tipo || ''} ${item.formato || ''}`.trim(),
        tipoMovimentacao: 'SAIDA',
        quantidade: qtd,
        unidade: 'folhas',
        tipoMaquina: req.body.tipoMaquina || '',
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || ''
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação de papelcartão (SAIDA):', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Retorno — devolve folhas ao estoque, registra perda em kg e gera folhas filhas
// body: {
//   quantidadeRetorno: number (folhas que voltaram ao estoque),
//   perdaKg: number (peso da perda em kg),
//   filhas: [{ formato, quantidade }] (folhas filhas a criar - herdam tipo/gramatura/localização do pai),
//   usuario, observacoes
// }
router.post('/:id/retorno', async (req, res) => {
  try {
    const qtdRetorno = parseInt(req.body.quantidadeRetorno, 10) || 0;
    const perdaKg = parseFloat(req.body.perdaKg) || 0;
    const filhas = Array.isArray(req.body.filhas) ? req.body.filhas : [];

    if (qtdRetorno < 0) return res.status(400).json({ error: 'Quantidade de retorno inválida' });
    if (perdaKg < 0) return res.status(400).json({ error: 'Perda em kg inválida' });

    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });

    const emUso = item.quantidadeEmUso || 0;

    if (qtdRetorno > emUso) {
      return res.status(400).json({
        error: `Retorno (${qtdRetorno}) maior que a quantidade em uso (${emUso}).`
      });
    }

    // Soma das folhas filhas (apenas informativa - cortes podem gerar mais folhas que o original)
    const totalFilhas = filhas.reduce((s, f) => s + (parseInt(f.quantidade, 10) || 0), 0);

    // Atualiza o item pai
    item.quantidade = (item.quantidade || 0) + qtdRetorno;
    // Zera o que estava em uso (todo o material original foi processado: voltou, virou filha, virou perda ou refilo)
    item.quantidadeEmUso = 0;
    item.maquinaAtual = ''; // ciclo encerrado
    item.ultimoRetorno = {
      data: new Date(),
      quantidadeRetorno: qtdRetorno,
      perdaKg,
      filhasGeradas: totalFilhas,
      usuario: req.body.usuario || '',
      observacoes: req.body.observacoes || ''
    };
    await item.save();

    // Cria as folhas filhas (herdando tipo/gramatura/localização do pai, só muda formato e quantidade)
    const filhasCriadas = [];
    for (const f of filhas) {
      const qFilha = parseInt(f.quantidade, 10) || 0;
      const fmtFilha = (f.formato || '').trim();
      if (qFilha <= 0 || !fmtFilha) continue;
      const codigo = await proximoCodigo();
      const nova = new Papelcartao({
        codigo,
        tipo: item.tipo,
        localizacao: item.localizacao,
        quantidade: qFilha,
        formato: fmtFilha,
        gramatura: item.gramatura,
        status: 'DISPONÍVEL',
        quantidadeEmUso: 0,
        observacoes: `Originada do retorno de ${item.codigo}`,
        idPai: item._id
      });
      await nova.save();
      filhasCriadas.push(nova);
    }

    // Grava no histórico de movimentações (RETORNO do pai)
    try {
      await new Movimentacao({
        tipoItem: 'papelcartao',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: `${item.tipo || ''} ${item.formato || ''}`.trim(),
        tipoMovimentacao: 'RETORNO',
        quantidade: qtdRetorno,
        unidade: 'folhas',
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || '',
        perdaKg,
        filhasGeradas: totalFilhas
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação de papelcartão (RETORNO):', e);
    }

    res.json({ pai: item, filhas: filhasCriadas, perdaKg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Transferência entre máquinas — não mexe em estoque, só muda a máquina atual
// body: { novaMaquina, usuario, observacoes, perdaKg }
router.post('/:id/transferir', async (req, res) => {
  try {
    const novaMaquina = (req.body.novaMaquina || '').trim();
    if (!novaMaquina) return res.status(400).json({ error: 'Nova máquina é obrigatória' });

    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    if ((item.quantidadeEmUso || 0) <= 0) {
      return res.status(400).json({ error: 'Este papelcartão não está em uso (não há lote para transferir).' });
    }

    const perdaKg = parseFloat(req.body.perdaKg) || 0;
    const maquinaAnterior = item.maquinaAtual || '-';
    item.maquinaAtual = novaMaquina;
    await item.save();

    // Grava no histórico de movimentações
    try {
      await new Movimentacao({
        tipoItem: 'papelcartao',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: `${item.tipo || ''} ${item.formato || ''}`.trim(),
        tipoMovimentacao: 'TRANSFERENCIA',
        quantidade: item.quantidadeEmUso || 0,
        unidade: 'folhas',
        tipoMaquina: `${maquinaAnterior} → ${novaMaquina}`,
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || '',
        perdaKg
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação de papelcartão (TRANSFERENCIA):', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
