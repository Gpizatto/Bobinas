const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const db = require('../config/db'); // ajusta conforme seu setup

router.get('/etiqueta/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const bobina = await db.collection('bobinas').findOne({ _id: new ObjectId(id) });
    if (!bobina) return res.status(404).send('Bobina não encontrada');
    
    res.send(`<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <title>Etiqueta da Bobina</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          h2 { font-size: 24px; }
          p { margin: 4px 0; font-size: 18px; }
        </style>
      </head>
      <body>
        <h2>Etiqueta de Bobina</h2>
        <p><strong>ID:</strong> ${bobina._id}</p>
        <!-- Adicione os campos que desejar -->
        <script>
          setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
