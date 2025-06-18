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
    codigoQR: {
        type: String,
        default: () => `BOBINA-${Date.now()}`
    }
});

module.exports = mongoose.model('Bobina', BobinaSchema);
