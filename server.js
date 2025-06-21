const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Inicializando o app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB Atlas
const connectDB = require('./config/db');
connectDB();


// Importando rotas
const bobinasRoutes = require('./routes/bobinas');
const movimentacoesRoutes = require('./routes/movimentacoes');
const bobinasOrigemRoutes = require('./routes/bobinasOrigem');
const folhasRoutes = require('./routes/folhas');
const etiquetaRoutes = require('./routes/etiqueta');
app.use('/', etiquetaRoutes);


app.use('/bobinas', bobinasRoutes);
app.use('/movimentacoes', movimentacoesRoutes);
app.use('/bobinas-origem', bobinasOrigemRoutes);
app.use('/folhas', folhasRoutes);

// Rota base
app.get('/', (req, res) => {
  res.send('API Controle de Bobinas Online ✅');
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
