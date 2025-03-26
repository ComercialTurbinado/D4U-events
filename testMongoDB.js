import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://comercialturbinado:bm3H1IgSMdgqyS25@d4uevents.cuftzbf.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(MONGODB_URI);

async function testMongoDB() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');

    // Inserir um novo tipo de evento
    const database = client.db('test');
    const eventTypes = database.collection('eventtypes');

     
    // Ler todos os tipos de eventos
    const tipos = await eventTypes.find().toArray();
    console.log('Tipos de eventos:', tipos);
  } catch (error) {
    console.error('Erro ao operar no MongoDB:', error);
  } finally {
    await client.close();
  }
}

testMongoDB(); 