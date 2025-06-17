const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema para o relacionamento entre bobinas
const BobinaOrigemSchema = new mongoose.Schema({
  idBobinaOrigem: String,
  idBobinaNova: String
});

// Model
const BobinaOrigem = mongoose.model('BobinaOrigem', BobinaOrigemSchema);

// GET /bobinas-origem?idBobinaOrigem=xxxxx
router.get('/', async (req, res) => {
  try {
    const { idBobinaOrigem } = req.query;
    const filtro = idBobinaOrigem ? { idBobinaOrigem } : {};
    const relacoes = await BobinaOrigem.find(filtro);
    res.json(relacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bobinas-origem
router.post('/', async (req, res) => {
  try {
    const novaRelacao = new BobinaOrigem(req.body);
    await novaRelacao.save();
    res.status(201).json(novaRelacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
