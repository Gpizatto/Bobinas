const mongoose = require('mongoose');

// Lote em uso — cada saída cria um documento aqui.
const LoteEmUsoSchema = new mongoose.Schema({
  quantidade: { type: Number, required: true },
  maquinaAtual: { type: String, default: '' },
  usuario: { type: String, default: '' },
  observacoes: { type: String, default: '' },
  dataSaida: { type: Date, default: Date.now }
});

const FolhaBobinaSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  tipo: { type: String, required: true }, // herdado da bobina de origem
  localizacao: { type: String, default: '' },
  quantidade: { type: Number, required: true, default: 0 },
  quantidadeGerada: { type: Number, default: null }, // quantidade original gerada (fixa, não muda com uso)
  formato: { type: String, default: '' },
  gramatura: { type: Number, default: 0 },
  status: { type: String, default: 'DISPONÍVEL' },
  lotesEmUso: [LoteEmUsoSchema],
  quantidadeEmUso: { type: Number, default: 0 }, // recalculado
  maquinaAtual: { type: String, default: '' },   // recalculado (concat)
  observacoes: { type: String, default: '' },
  dataCadastro: { type: Date, default: Date.now },
  bobinaOrigem: { type: mongoose.Schema.Types.ObjectId, ref: 'Bobina', default: null }, // qual bobina gerou
  idPai: { type: mongoose.Schema.Types.ObjectId, ref: 'FolhaBobina', default: null },   // se veio de retorno de outra folha
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

module.exports = mongoose.model('FolhaBobina', FolhaBobinaSchema);
