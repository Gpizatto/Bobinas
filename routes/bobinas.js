const express = require('express');
const router = express.Router();
const Bobina = require('../models/Bobina');

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
// 🔥 DELETE - Apagar TODO o estoque de bobinas
router.delete('/', async (req, res) => {
  try {
    await Bobina.deleteMany({});
    res.json({ message: 'Estoque apagado com sucesso' });
  } catch (err) {
    console.error('Erro ao apagar estoque:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
