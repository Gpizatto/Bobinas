const mongoose = require('mongoose');

const BobinaSchema = new mongoose.Schema({
    tipoPapel: String,
    fabricante: String,
    peso: Number,
    pesoInicial: Number,
    largura: Number,
    gramatura: Number,
    fornecedor: String,
    localizacao: String,
    dataEntrada: Date,
    dataSaida: Date,
    // Status da bobina: DISPONÍVEL | EM USO | FINALIZADA
    // Atualizado automaticamente quando o saldo (peso) chega a zero.
    status: {
        type: String,
        default: 'DISPONÍVEL'
    },
    codigoQR: {
        type: String,
        default: () => `BOBINA-${Date.now()}`
    }
});

module.exports = mongoose.model('Bobina', BobinaSchema);
