const mongoose = require('mongoose');

const MovimentacaoSchema = new mongoose.Schema({
  idBobina: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bobina'
  },
  tipoMovimentacao: String,  // ENTRADA, SAIDA, RETORNO, etc
  quantidade: Number,
  usuario: String,
  observacoes: String,
  data: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movimentacao', MovimentacaoSchema);
