const express = require('express');
const router = express.Router();
const Papelcartao = require('../models/Papelcartao');

// Gera próximo código sequencial PC-0001, PC-0002...
async function proximoCodigo() {
  const ultimo = await Papelcartao.findOne({ codigo: /^PC-\d+$/ })
    .sort({ codigo: -1 })
    .select('codigo')
    .lean();
  let n = 0;
  if (ultimo && ultimo.codigo) {
    const m = ultimo.codigo.match(/^PC-(\d+)$/);
    if (m) n = parseInt(m[1], 10);
  }
  return `PC-${String(n + 1).padStart(4, '0')}`;
}

// GET todos
router.get('/', async (req, res) => {
  try {
    const itens = await Papelcartao.find().sort({ codigo: 1 });
    res.json(itens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST criar
router.post('/', async (req, res) => {
  try {
    const dados = { ...req.body };
    if (!dados.codigo || !dados.codigo.trim()) {
      dados.codigo = await proximoCodigo();
    }
    const novo = new Papelcartao(dados);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar
router.put('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json({ message: 'Registro removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST entrada — incrementa
router.post('/:id/entrada', async (req, res) => {
  try {
    const qtd = parseInt(req.body.quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
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
    const qtd = parseInt(req.body.quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
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