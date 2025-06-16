import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch((error) => console.error('❌ Erro ao conectar no MongoDB:', error));

// Modelo de exemplo
const Bobina = mongoose.model('Bobina', {
  nome: String,
  largura: Number,
  metragem: Number,
});

// Rotas de teste
app.get('/bobinas', async (req, res) => {
  const bobinas = await Bobina.find();
  res.json(bobinas);
});

// Porta para o Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
