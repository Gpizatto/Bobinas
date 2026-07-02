const mongoose = require('mongoose');

const ProdutoAcabadoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  descricao: { type: String, default: '' },
  quantidadeLote: { type: Number, default: 0 }, // "Quant." da planilha - referência do lote
  local: { type: String, default: '' },
  totalEntradas: { type: Number, default: 0 },
  totalSaidas: { type: Number, default: 0 },
  observacoes: { type: String, default: '' },
  dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProdutoAcabado', ProdutoAcabadoSchema);
