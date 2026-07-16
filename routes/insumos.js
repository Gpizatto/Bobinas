const express = require('express');
const router = express.Router();
const Insumo = require('../models/Insumo');
const Movimentacao = require('../models/Movimentacao');

// GET todos os insumos
router.get('/', async (req, res) => {
  try {
    const insumos = await Insumo.find().sort({ codigo: 1 });
    res.json(insumos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Insumo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Insumo não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST criar insumo
router.post('/', async (req, res) => {
  try {
    if (!req.body.codigo || !req.body.codigo.trim()) {
      return res.status(400).json({ error: 'Código é obrigatório' });
    }
    const existe = await Insumo.findOne({ codigo: req.body.codigo.trim() });
    if (existe) return res.status(400).json({ error: 'Já existe um insumo com esse código.' });

    const novo = new Insumo(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar dados
router.put('/:id', async (req, res) => {
  try {
    const item = await Insumo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Insumo não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await Insumo.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Insumo não encontrado' });
    res.json({ message: 'Insumo removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST entrada
router.post('/:id/entrada', async (req, res) => {
  try {
    const qtd = parseFloat(req.body.quantidade);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Insumo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Insumo não encontrado' });

    item.totalEntradas = (item.totalEntradas || 0) + qtd;
    await item.save();

    try {
      await new Movimentacao({
        tipoItem: 'insumo',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: item.descricao || '',
        tipoMovimentacao: 'ENTRADA',
        quantidade: qtd,
        unidade: 'un',
        usuario: req.body.usuario || '',
        cliente: req.body.cliente || '',
        observacoes: req.body.observacoes || ''
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação insumo ENTRADA:', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST saída
router.post('/:id/saida', async (req, res) => {
  try {
    const qtd = parseFloat(req.body.quantidade);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Insumo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Insumo não encontrado' });

    const saldo = (item.totalEntradas || 0) - (item.totalSaidas || 0);
    if (qtd > saldo) {
      return res.status(400).json({ error: `Quantidade insuficiente. Saldo: ${saldo}` });
    }

    item.totalSaidas = (item.totalSaidas || 0) + qtd;
    await item.save();

    try {
      await new Movimentacao({
        tipoItem: 'insumo',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: item.descricao || '',
        tipoMovimentacao: 'SAIDA',
        quantidade: qtd,
        unidade: 'un',
        usuario: req.body.usuario || '',
        cliente: req.body.cliente || '',
        observacoes: req.body.observacoes || ''
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação insumo SAIDA:', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
