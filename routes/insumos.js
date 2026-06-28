const express = require('express');
const router = express.Router();
const Insumo = require('../models/Insumo');

// GET todos os lançamentos (ordenados por data, mais recentes primeiro)
// Suporta filtros opcionais: ?codigo=XX&funcionario=YY&setor=ZZ&inicio=ISO&fim=ISO
router.get('/', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.codigo) filtro.codigo = req.query.codigo;
    if (req.query.funcionario) filtro.funcionario = req.query.funcionario;
    if (req.query.setor) filtro.setor = req.query.setor;
    if (req.query.inicio || req.query.fim) {
      filtro.data = {};
      if (req.query.inicio) filtro.data.$gte = new Date(req.query.inicio);
      if (req.query.fim) filtro.data.$lte = new Date(req.query.fim);
    }
    const lancamentos = await Insumo.find(filtro).sort({ data: 1, _id: 1 });
    res.json(lancamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Insumo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST novo lançamento
router.post('/', async (req, res) => {
  try {
    if (!req.body.codigo) return res.status(400).json({ error: 'Código é obrigatório' });
    const novo = new Insumo(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar lançamento
router.put('/:id', async (req, res) => {
  try {
    const item = await Insumo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE lançamento
router.delete('/:id', async (req, res) => {
  try {
    const item = await Insumo.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Lançamento não encontrado' });
    res.json({ message: 'Lançamento removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
