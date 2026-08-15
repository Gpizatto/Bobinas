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
    maquinaAtual: { type: String, default: '' },
    // Status da bobina: DISPONÍVEL | EM USO | FINALIZADA
    // Atualizado automaticamente quando o saldo (peso) chega a zero.
    status: {
        type: String,
        default: 'DISPONÍVEL'
    },
    codigoQR: {
        type: String,
        default: () => `BOBINA-${Date.now()}`
    },
    // ===== Campos de PRODUÇÃO (bobinas geradas pelas máquinas: Laminadora / Flexo) =====
    // Quando produzidaPorMaquina = true, a bobina NÃO aparece no estoque normal
    // de Bobinas — ela fica só na aba "Máquinas".
    produzidaPorMaquina: { type: Boolean, default: false },
    maquinaProducao: { type: String, default: '' }, // 'Impressora Laminadora' | 'Impressora Flexo'
    bobinaOrigem1Codigo: { type: String, default: '' },
    bobinaOrigem1Tipo: { type: String, default: '' },
    bobinaOrigem2Codigo: { type: String, default: '' },
    bobinaOrigem2Tipo: { type: String, default: '' },
    cliente: { type: String, default: '' },
    comImpressao: { type: Boolean, default: false },
    qualImpressao: { type: String, default: '' },
    observacoesProducao: { type: String, default: '' },
    loteProducao: { type: String, default: '' } // agrupa bobinas geradas na mesma produção
});

module.exports = mongoose.model('Bobina', BobinaSchema);
