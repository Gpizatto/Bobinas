// server.js
import express from 'express';

const app = express();

// Rotas exemplo
app.get('/', (req, res) => {
  res.send('Servidor rodando no Render!');
});

// Porta que o Render disponibiliza via variável de ambiente
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
