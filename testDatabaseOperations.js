import { connectDB, EventType } from './src/api/mongodb.js';

async function testDatabaseOperations() {
  try {
    await connectDB();

    // Inserir um novo tipo de evento
    const novoTipo = await EventType.create({
      name: 'Conferência',
      description: 'Evento de conferência anual'
    });
    console.log('Novo tipo de evento criado:', novoTipo);

    // Ler todos os tipos de eventos
    const tipos = await EventType.find();
    console.log('Tipos de eventos:', tipos);
  } catch (error) {
    console.error('Erro ao operar no MongoDB:', error);
  }
}

testDatabaseOperations(); 