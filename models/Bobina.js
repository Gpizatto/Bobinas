const mongoose = require('mongoose');

const BobinaSchema = new mongoose.Schema({
  tipoPapel: String,
  fabricante: String,
  peso: Number,
  largura: Number,
  gramatura: Number,
  fornecedor: String,
  localizacao: String,
  status: {
    type: String,
    enum: ['DISPONIVEL', 'EM_USO'],
    default: 'DISPONIVEL'
  },
  dataEntrada: {
    type: Date,
    default: Date.now
  },
  dataSaida: Date
});

module.exports = mongoose.model('Bobina', BobinaSchema);
