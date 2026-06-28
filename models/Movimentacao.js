const mongoose = require('mongoose');

const MovimentacaoSchema = new mongoose.Schema({
  // Para bobinas (legado): idBobina referencia o documento Bobina.
  // Para papelcartão: usar tipoItem='papelcartao' + idItem (mesma collection, igual idBobina).
  idBobina: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bobina'
  },
  // Novos campos para suportar mais de um tipo de item
  tipoItem: { type: String, default: 'bobina' }, // 'bobina' | 'papelcartao'
  idItem: { type: mongoose.Schema.Types.ObjectId }, // referência genérica
  codigoItem: { type: String, default: '' }, // código exibido (codigoQR da bobina ou codigo do PC)
  descricaoItem: { type: String, default: '' }, // descrição curta (tipo de papel, formato, etc.)

  tipoMovimentacao: String,  // ENTRADA, SAIDA, RETORNO
  quantidade: Number,        // kg para bobinas, folhas para papelcartão
  unidade: { type: String, default: 'kg' }, // 'kg' | 'folhas'
  tipoMaquina: { type: String, default: '' },
  usuario: String,
  observacoes: String,
  // Campos extras para retorno de papelcartão
  perdaKg: { type: Number, default: 0 },
  filhasGeradas: { type: Number, default: 0 },

  data: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movimentacao', MovimentacaoSchema);
