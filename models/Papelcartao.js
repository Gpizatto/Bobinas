const mongoose = require('mongoose');

const PapelcartaoSchema = new mongoose.Schema({
  codigo: { type: String, unique: true }, // PC-0001, PC-0002...
  tipo: { type: String, required: true },
  localizacao: { type: String, default: '' },
  quantidade: { type: Number, required: true, default: 0 },
  larguraCm: { type: Number, required: true },
  comprimentoCm: { type: Number, required: true },
  gramatura: { type: Number, default: 0 }, // g/m²
  // Status manual: DISPONÍVEL ou INATIVA. SEM ESTOQUE é derivado da quantidade.
  status: { type: String, default: 'DISPONÍVEL' },
  observacoes: { type: String, default: '' },
  dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Papelcartao', PapelcartaoSchema);