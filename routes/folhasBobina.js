const express = require('express');
const router = express.Router();
const FolhaBobina = require('../models/FolhaBobina');
const Movimentacao = require('../models/Movimentacao');

async function proximoCodigo() {
  const ultimo = await FolhaBobina.findOne({ codigo: /^FB-\d+$/ })
    .sort({ codigo: -1 })
    .select('codigo')
    .lean();
  let n = 0;
  if (ultimo && ultimo.codigo) {
    const m = ultimo.codigo.match(/^FB-(\d+)$/);
    if (m) n = parseInt(m[1], 10);
  }
  return `FB-${String(n + 1).padStart(4, '0')}`;
}

// Uso interno: cria uma Folha de Bobina (usado pela rota de retorno de bobinas)
async function criarFolhaBobinaInterno(dados) {
  if (!dados.codigo) dados.codigo = await proximoCodigo();
  const nova = new FolhaBobina(dados);
  await nova.save();
  return nova;
}

router.get('/', async (req, res) => {
  try {
    const itens = await FolhaBobina.find().sort({ codigo: 1 });
    res.json(itens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await FolhaBobina.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const dados = { ...req.body };
    if (!dados.codigo || !dados.codigo.trim()) {
      dados.codigo = await proximoCodigo();
    }
    const novo = new FolhaBobina(dados);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await FolhaBobina.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await FolhaBobina.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json({ message: 'Registro removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Entrada — incrementa saldo
router.post('/:id/entrada', async (req, res) => {
  try {
    const qtd = parseInt(req.body.quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await FolhaBobina.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    item.quantidade = (item.quantidade || 0) + qtd;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Saída — cria um novo lote em uso
router.post('/:id/saida', async (req, res) => {
  try {
    const qtd = parseInt(req.body.quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) return res.status(400).json({ error: 'Quantidade inválida' });
    const item = await FolhaBobina.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });
    if (qtd > (item.quantidade || 0)) {
      return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
    }

    const tipoMaquina = (req.body.tipoMaquina || '').trim();
    if (!tipoMaquina) return res.status(400).json({ error: 'Máquina é obrigatória na saída' });

    item.quantidade = (item.quantidade || 0) - qtd;
    if (!Array.isArray(item.lotesEmUso)) item.lotesEmUso = [];
    item.lotesEmUso.push({
      quantidade: qtd,
      maquinaAtual: tipoMaquina,
      usuario: req.body.usuario || '',
      observacoes: req.body.observacoes || '',
      dataSaida: new Date()
    });

    item.quantidadeEmUso = item.lotesEmUso.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
    const maqs = [...new Set(item.lotesEmUso.map(l => l.maquinaAtual).filter(Boolean))];
    item.maquinaAtual = maqs.join(', ');

    item.ultimaSaida = {
      data: new Date(),
      quantidade: qtd,
      tipoMaquina,
      usuario: req.body.usuario || '',
      observacoes: req.body.observacoes || ''
    };
    await item.save();

    try {
      await new Movimentacao({
        tipoItem: 'folha_bobina',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: `${item.tipo || ''} ${item.formato || ''}`.trim(),
        tipoMovimentacao: 'SAIDA',
        quantidade: qtd,
        unidade: 'folhas',
        tipoMaquina,
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || ''
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação (SAIDA folha_bobina):', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Retorno — encerra um lote específico
router.post('/:id/retorno', async (req, res) => {
  try {
    const item = await FolhaBobina.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });

    const loteId = req.body.loteId;
    if (!loteId) return res.status(400).json({ error: 'É preciso informar qual lote está sendo retornado.' });

    const lote = item.lotesEmUso.id(loteId);
    if (!lote) return res.status(400).json({ error: 'Lote não encontrado.' });

    const qtdRetorno = parseInt(req.body.quantidadeRetorno, 10) || 0;
    const perdaKg = parseFloat(req.body.perdaKg) || 0;
    const filhas = Array.isArray(req.body.filhas) ? req.body.filhas : [];

    if (qtdRetorno < 0) return res.status(400).json({ error: 'Quantidade de retorno inválida' });
    if (perdaKg < 0) return res.status(400).json({ error: 'Perda em kg inválida' });
    if (qtdRetorno > (lote.quantidade || 0)) {
      return res.status(400).json({ error: `Retorno (${qtdRetorno}) maior que o lote (${lote.quantidade}).` });
    }

    const maquinaDoLote = lote.maquinaAtual;
    item.quantidade = (item.quantidade || 0) + qtdRetorno;
    lote.deleteOne();

    const filhasCriadas = [];
    const totalFilhas = filhas.reduce((s, f) => s + (parseInt(f.quantidade, 10) || 0), 0);
    for (const f of filhas) {
      const qFilha = parseInt(f.quantidade, 10) || 0;
      const fmtFilha = (f.formato || '').trim();
      if (qFilha <= 0 || !fmtFilha) continue;
      const codigo = await proximoCodigo();
      const nova = new FolhaBobina({
        codigo,
        tipo: item.tipo,
        localizacao: item.localizacao,
        quantidade: qFilha,
        formato: fmtFilha,
        gramatura: item.gramatura,
        status: 'DISPONÍVEL',
        quantidadeEmUso: 0,
        observacoes: `Originada do retorno de ${item.codigo}`,
        idPai: item._id,
        bobinaOrigem: item.bobinaOrigem || null
      });
      await nova.save();
      filhasCriadas.push(nova);
    }

    item.quantidadeEmUso = item.lotesEmUso.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
    const maqs = [...new Set(item.lotesEmUso.map(l => l.maquinaAtual).filter(Boolean))];
    item.maquinaAtual = maqs.join(', ');

    item.ultimoRetorno = {
      data: new Date(),
      quantidadeRetorno: qtdRetorno,
      perdaKg,
      filhasGeradas: totalFilhas,
      usuario: req.body.usuario || '',
      observacoes: req.body.observacoes || ''
    };
    await item.save();

    try {
      await new Movimentacao({
        tipoItem: 'folha_bobina',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: `${item.tipo || ''} ${item.formato || ''}`.trim(),
        tipoMovimentacao: 'RETORNO',
        quantidade: qtdRetorno,
        unidade: 'folhas',
        tipoMaquina: maquinaDoLote,
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || '',
        perdaKg,
        filhasGeradas: totalFilhas
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação (RETORNO folha_bobina):', e);
    }

    res.json({ pai: item, filhas: filhasCriadas, perdaKg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Transferência — move UM lote para outra máquina
router.post('/:id/transferir', async (req, res) => {
  try {
    const novaMaquina = (req.body.novaMaquina || '').trim();
    if (!novaMaquina) return res.status(400).json({ error: 'Nova máquina é obrigatória' });

    const item = await FolhaBobina.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Registro não encontrado' });

    const loteId = req.body.loteId;
    if (!loteId) return res.status(400).json({ error: 'É preciso informar qual lote está sendo transferido.' });

    const lote = item.lotesEmUso.id(loteId);
    if (!lote) return res.status(400).json({ error: 'Lote não encontrado.' });

    const perdaKg = parseFloat(req.body.perdaKg) || 0;
    const folhasPerdidas = parseInt(req.body.folhasPerdidas, 10) || 0;
    if (folhasPerdidas < 0) return res.status(400).json({ error: 'Folhas perdidas inválidas' });
    if (folhasPerdidas > (lote.quantidade || 0)) {
      return res.status(400).json({
        error: `Folhas perdidas (${folhasPerdidas}) maior que o lote (${lote.quantidade}).`
      });
    }

    const maquinaAnterior = lote.maquinaAtual || '-';
    if (maquinaAnterior === novaMaquina) {
      return res.status(400).json({ error: 'A máquina escolhida é a mesma atual do lote.' });
    }

    lote.quantidade = (lote.quantidade || 0) - folhasPerdidas;
    lote.maquinaAtual = novaMaquina;

    item.quantidadeEmUso = item.lotesEmUso.reduce((s, l) => s + (parseInt(l.quantidade, 10) || 0), 0);
    const maqs = [...new Set(item.lotesEmUso.map(l => l.maquinaAtual).filter(Boolean))];
    item.maquinaAtual = maqs.join(', ');

    await item.save();

    try {
      await new Movimentacao({
        tipoItem: 'folha_bobina',
        idItem: item._id,
        codigoItem: item.codigo || '',
        descricaoItem: `${item.tipo || ''} ${item.formato || ''}`.trim(),
        tipoMovimentacao: 'TRANSFERENCIA',
        quantidade: lote.quantidade || 0,
        unidade: 'folhas',
        tipoMaquina: `${maquinaAnterior} → ${novaMaquina}`,
        usuario: req.body.usuario || '',
        observacoes: req.body.observacoes || '',
        perdaKg,
        filhasGeradas: folhasPerdidas
      }).save();
    } catch (e) {
      console.error('Falha ao gravar movimentação (TRANSFERENCIA folha_bobina):', e);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
module.exports.criarFolhaBobinaInterno = criarFolhaBobinaInterno;
module.exports.proximoCodigoFolhaBobina = proximoCodigo;
