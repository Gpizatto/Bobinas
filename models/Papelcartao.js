const mongoose = require('mongoose');

const PapelcartaoSchema = new mongoose.Schema({
  codigo: { type: String, unique: true }, // PC-0001, PC-0002...
  tipo: { type: String, required: true },
  localizacao: { type: String, default: '' },
  quantidade: { type: Number, required: true, default: 0 },
  formato: { type: String, default: '' }, // texto livre: 64x96, 50x70 etc.
  gramatura: { type: Number, default: 0 }, // g/m²
  // Status manual: DISPONÍVEL ou INATIVA. SEM ESTOQUE/EM USO são derivados.
  status: { type: String, default: 'DISPONÍVEL' },
  // Quantidade que está fora (em uso). >0 significa EM USO.
  quantidadeEmUso: { type: Number, default: 0 },
  observacoes: { type: String, default: '' },
  dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Papelcartao', PapelcartaoSchema);
