const mongoose = require('mongoose');

// Cada documento é UM lançamento (entrada ou saída) — modelo livro-razão.
// O Total por código é calculado dinamicamente (soma de entradas - saídas).
const InsumoSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now },
  codigo: { type: String, required: true },
  fabricante: { type: String, default: '' },
  descricao: { type: String, default: '' },
  funcionario: { type: String, default: '' },
  setor: { type: String, default: '' },
  entrada: { type: Number, default: 0 },
  saida: { type: Number, default: 0 }
});

module.exports = mongoose.model('Insumo', InsumoSchema);
