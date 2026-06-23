const mongoose = require('mongoose');

const InsumoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: Number, required: true, default: 0 },
  unidade: { type: String, default: '' }, // texto livre: L, kg, un, m...
  observacoes: { type: String, default: '' },
  dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Insumo', InsumoSchema);