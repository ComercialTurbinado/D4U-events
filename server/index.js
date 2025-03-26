import express from 'express';
import cors from 'cors';
import { connectDB, Event } from '../src/api/mongodb.js';

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.get('/api/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Backend rodando na porta ${PORT}`));