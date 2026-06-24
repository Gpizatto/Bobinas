const mongoose = require('mongoose');

const PapelcartaoSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  tipo: { type: String, required: true },
  localizacao: { type: String, default: '' },
  quantidade: { type: Number, required: true, default: 0 },
  formato: { type: String, default: '' },
  gramatura: { type: Number, default: 0 },
  status: { type: String, default: 'DISPONÍVEL' },
  quantidadeEmUso: { type: Number, default: 0 },
  observacoes: { type: String, default: '' },
  dataCadastro: { type: Date, default: Date.now },
  idPai: { type: mongoose.Schema.Types.ObjectId, ref: 'Papelcartao', default: null },
  ultimaSaida: {
    data: Date,
    quantidade: Number,
    tipoMaquina: String,
    usuario: String,
    observacoes: String
  },
  ultimoRetorno: {
    data: Date,
    quantidadeRetorno: Number,
    perdaKg: Number,
    filhasGeradas: Number,
    usuario: String,
    observacoes: String
  }
});

module.exports = mongoose.model('Papelcartao', PapelcartaoSchema);
