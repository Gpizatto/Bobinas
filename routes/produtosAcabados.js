const express = require('express');
const router = express.Router();
const ProdutoAcabado = require('../models/ProdutoAcabado');
const Movimentacao = require('../models/Movimentacao');

// GET todos
router.get('/', async (req, res) => {
  try {
    const itens = await ProdutoAcabado.find().sort({ codigo: 1 });
    res.json(itens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await ProdutoAcabado.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST criar produto
router.post('/', async (req, res) => {
  try {
    if (!req.body.codigo || !req.body.codigo.trim()) {
      return res.status(400).json({ error: 'Código é obrigatório' });
    }
    // Impede duplicidade
    const existe = await ProdutoAcabado.findOne({ codigo: req.body.codigo.trim() });
    if (existe) return res.status(400).json({ error: 'Já existe um produto com esse código.' });

    const novo = new ProdutoAcabado(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT atualizar dados do produto (código, descrição, quant, local...)
router.put('/:id', async (req, res) => {
  try {
    const item = await ProdutoAcabado.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await ProdutoAcabado.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST entrada
// body: { quantidade, usuario, observacoes }
router.post('/:id/entrada', async (req, res) => {
  try {
    const qtd = parseFloat(req.body.quantidade);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await ProdutoAcabado.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Produto não encontrado' });

    item.totalEntradas = (item.totalEntradas || 0) + qtd;
    await item.save();

    // Grava histórico
    try {
      await new Movimentacao({
        tipoItem: 'produto_acabado',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: item.descricao || '',
        tipoMovimentacao: 'ENTRADA',
        quantidade: qtd,
        unidade: 'un',
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || ''
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação de produto acabado (ENTRADA):', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST saída
// body: { quantidade, usuario, observacoes }
router.post('/:id/saida', async (req, res) => {
  try {
    const qtd = parseFloat(req.body.quantidade);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await ProdutoAcabado.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Produto não encontrado' });

    const saldo = (item.totalEntradas || 0) - (item.totalSaidas || 0);
    if (qtd > saldo) {
      return res.status(400).json({ error: `Quantidade insuficiente. Saldo atual: ${saldo}` });
    }

    item.totalSaidas = (item.totalSaidas || 0) + qtd;
    await item.save();

    try {
      await new Movimentacao({
        tipoItem: 'produto_acabado',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: item.descricao || '',
        tipoMovimentacao: 'SAIDA',
        quantidade: qtd,
        unidade: 'un',
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || ''
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação de produto acabado (SAIDA):', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
