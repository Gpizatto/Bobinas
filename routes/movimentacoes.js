const express = require('express');
const router = express.Router();
const Movimentacao = require('../models/Movimentacao');

// GET todas as movimentações
router.get('/', async (req, res) => {
  try {
    const movimentacoes = await Movimentacao.find().sort({ data: -1 });
    res.json(movimentacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST criar nova movimentação
router.post('/', async (req, res) => {
  try {
    const novaMovimentacao = new Movimentacao(req.body);
    await novaMovimentacao.save();
    res.status(201).json(novaMovimentacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
