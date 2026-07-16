const mongoose = require('mongoose');

// Modelo estilo "Produtos Acabados": cada documento é UM insumo (código único),
// com acumuladores de Entrada e Saída. O Total = totalEntradas - totalSaidas.
const InsumoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  fabricante: { type: String, default: '' },
  descricao: { type: String, default: '' },
  funcionario: { type: String, default: '' }, // opcional (referência inicial)
  setor: { type: String, default: '' },       // opcional (referência inicial)
  totalEntradas: { type: Number, default: 0 },
  totalSaidas: { type: Number, default: 0 },
  observacoes: { type: String, default: '' },
  dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Insumo', InsumoSchema);
