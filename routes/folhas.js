const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema para Folhas
const FolhaSchema = new mongoose.Schema({
  idBobinaOrigem: String,
  quantidade: Number,
  formato: String,
  cliente: String,
  pesoUtilizado: Number,
  dataProcessamento: Date
});

const Folha = mongoose.model('Folha', FolhaSchema);

// GET /folhas?idBobinaOrigem=xxxxx
router.get('/', async (req, res) => {
  try {
    const { idBobinaOrigem } = req.query;
    const filtro = idBobinaOrigem ? { idBobinaOrigem } : {};
    const folhas = await Folha.find(filtro);
    res.json(folhas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /folhas
router.post('/', async (req, res) => {
  try {
    const novaFolha = new Folha(req.body);
    await novaFolha.save();
    res.status(201).json(novaFolha);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
