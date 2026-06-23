const express = require('express');
const router = express.Router();
const Insumo = require('../models/Insumo');

// GET todos
router.get('/', async (req, res) => {
  try {
    const itens = await Insumo.find().sort({ nome: 1 });
    res.json(itens);
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

// POST criar
router.post('/', async (req, res) => {
  try {
    const novo = new Insumo(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar
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

// POST entrada — incrementa
router.post('/:id/entrada', async (req, res) => {
  try {
    const qtd = parseFloat(req.body.quantidade);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Insumo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Insumo não encontrado' });
    item.quantidade = (item.quantidade || 0) + qtd;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST saída — decrementa (não permite negativo)
router.post('/:id/saida', async (req, res) => {
  try {
    const qtd = parseFloat(req.body.quantidade);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Insumo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Insumo não encontrado' });
    if (qtd > (item.quantidade || 0)) {
      return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
    }
    item.quantidade = (item.quantidade || 0) - qtd;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;