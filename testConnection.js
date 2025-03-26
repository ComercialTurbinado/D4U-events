import { connectDB } from './src/api/mongodb.js';

async function testConnection() {
  try {
    await connectDB();
    console.log('Conexão com o MongoDB bem-sucedida!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  }
}

testConnection(); 