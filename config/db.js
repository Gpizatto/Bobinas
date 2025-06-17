const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🛠️ MONGO_URI:', process.env.MONGO_URI);  // <--- Adicionado
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB Atlas');
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
