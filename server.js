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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch((error) => console.error('❌ Erro ao conectar ao MongoDB:', error));

// Importando rotas
const bobinasRoutes = require('./routes/bobinas');
const movimentacoesRoutes = require('./routes/movimentacoes');

app.use('/bobinas', bobinasRoutes);
app.use('/movimentacoes', movimentacoesRoutes);

// Rota base
app.get('/', (req, res) => {
  res.send('API Controle de Bobinas Online ✅');
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
