import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb+srv://comercialturbinado:bm3H1IgSMdgqyS25@d4uevents.cuftzbf.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(MONGODB_URI);

// Conectar ao MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    return client.db('test');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

// Endpoints da API
app.get('/api/:collection', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection(req.params.collection);
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/:collection', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection(req.params.collection);
    const result = await collection.insertOne(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/:collection/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection(req.params.collection);
    const result = await collection.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection(req.params.collection);
    const result = await collection.deleteOne({ _id: req.params.id });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 