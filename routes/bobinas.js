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

// ✅ PUT atualizar bobina (SEM ALTERAR codigoQR)
router.put('/:id', async (req, res) => {
  try {
    // 🔒 NUNCA permitir alteração do código
    delete req.body.codigoQR;

    const bobina = await Bobina.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!bobina) {
      return res.status(404).json({ error: 'Bobina não encontrada' });
    }

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
// 🚀 IMPORTAÇÃO EM LOTE (BATCH)
router.post('/importar', async (req, res) => {
  try {
    const { novas, atualizadas } = req.body;

    let criadas = 0;
    let atualizadasCount = 0;

    // 🆕 cria novas bobinas
    if (Array.isArray(novas) && novas.length > 0) {
      await Bobina.insertMany(novas);
      criadas = novas.length;
    }

    // 🔁 atualiza existentes
    if (Array.isArray(atualizadas) && atualizadas.length > 0) {
      const ops = atualizadas.map(b => ({
        updateOne: {
          filter: { _id: b._id },
          update: b
        }
      }));

      await Bobina.bulkWrite(ops);
      atualizadasCount = atualizadas.length;
    }

    res.json({
      message: 'Importação concluída',
      criadas,
      atualizadas: atualizadasCount
    });

  } catch (err) {
    console.error('Erro na importação em lote:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
