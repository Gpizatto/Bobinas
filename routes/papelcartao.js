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

router.get('/', async (req, res) => {
  try {
    const itens = await Papelcartao.find().sort({ codigo: 1 });
    res.json(itens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.put('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Papelcartao.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json({ message: 'Registro removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Entrada — incrementa o saldo
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

// Saída — envia para uso: decrementa saldo e soma em "quantidadeEmUso"
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
    item.quantidadeEmUso = (item.quantidadeEmUso || 0) + qtd;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Retorno — devolve o que voltou do uso ao estoque
// body: { quantidade } onde quantidade é o que voltou disponível para o estoque
router.post('/:id/retorno', async (req, res) => {
  try {
    const qtd = parseInt(req.body.quantidade, 10);
    if (isNaN(qtd) || qtd < 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await Papelcartao.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    const emUso = item.quantidadeEmUso || 0;
    if (qtd > emUso) {
      return res.status(400).json({ error: `Retorno (${qtd}) maior que a quantidade em uso (${emUso}).` });
    }
    item.quantidade = (item.quantidade || 0) + qtd;
    item.quantidadeEmUso = emUso - qtd; // o que não voltou é considerado consumido
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
