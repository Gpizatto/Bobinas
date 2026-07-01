const express = require('express');
const router = express.Router();
const Bobina = require('../models/Bobina');
const Movimentacao = require('../models/Movimentacao');

// ✅ GET todas as bobinas
router.get('/', async (req, res) => {
  try {
    const bobinas = await Bobina.find();
    res.json(bobinas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST criar nova bobina
router.post('/', async (req, res) => {
  try {
    // Garante que sempre terá um codigoQR
    if (!req.body.codigoQR || req.body.codigoQR.trim() === "") {
      req.body.codigoQR = `BOBINA-${Date.now()}`;
    }

    const novaBobina = new Bobina(req.body);
    await novaBobina.save();
    res.status(201).json(novaBobina);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ GET bobina por ID
router.get('/:id', async (req, res) => {
  try {
    const bobina = await Bobina.findById(req.params.id);
    if (!bobina) return res.status(404).json({ error: 'Bobina não encontrada' });
    res.json(bobina);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT atualizar bobina
router.put('/:id', async (req, res) => {
  try {
    const bobina = await Bobina.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bobina) return res.status(404).json({ error: 'Bobina não encontrada' });
    res.json(bobina);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ DELETE bobina
router.delete('/:id', async (req, res) => {
  try {
    const result = await Bobina.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Bobina não encontrada' });
    res.json({ message: 'Bobina deletada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transferência entre máquinas — não mexe em peso, só muda a máquina atual
// body: { novaMaquina, usuario, observacoes }
router.post('/:id/transferir', async (req, res) => {
  try {
    const novaMaquina = (req.body.novaMaquina || '').trim();
    if (!novaMaquina) return res.status(400).json({ error: 'Nova máquina é obrigatória' });

    const bobina = await Bobina.findById(req.params.id);
    if (!bobina) return res.status(404).json({ error: 'Bobina não encontrada' });
    if (!bobina.dataSaida) {
      return res.status(400).json({ error: 'Esta bobina não está em uso (não há lote para transferir).' });
    }

    const maquinaAnterior = bobina.maquinaAtual || '-';
    bobina.maquinaAtual = novaMaquina;
    await bobina.save();

    // Grava no histórico de movimentações
    try {
      await new Movimentacao({
        idBobina: bobina._id,
        tipoItem: 'bobina',
        idItem: bobina._id,
        codigoItem: bobina.codigoQR || '',
        descricaoItem: `${bobina.tipoPapel || ''} ${bobina.largura ? bobina.largura + 'cm' : ''}`.trim(),
        tipoMovimentacao: 'TRANSFERENCIA',
        quantidade: bobina.peso || 0,
        unidade: 'kg',
        tipoMaquina: `${maquinaAnterior} → ${novaMaquina}`,
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || ''
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação de bobina (TRANSFERENCIA):', e);
    }

    res.json(bobina);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
