import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://comercialturbinado:bm3H1IgSMdgqyS25@d4uevents.cuftzbf.mongodb.net/test?retryWrites=true&w=majority";
const DB_NAME = process.env.DB_NAME || "test";

let client = null;
let db = null;

export const connectDB = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('MongoDB conectado com sucesso!');
  }
  return db;
};

const getCollection = async (collectionName) => {
  const database = await connectDB();
  return database.collection(collectionName);
};

const createEntityOperations = (collectionName) => ({
  list: async () => {
    try {
      const collection = await getCollection(collectionName);
      return await collection.find({}).toArray();
    } catch (error) {
      console.error(`Erro ao listar ${collectionName}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const collection = await getCollection(collectionName);
      const result = await collection.insertOne({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error(`Erro ao criar ${collectionName}:`, error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const collection = await getCollection(collectionName);
      const result = await collection.updateOne(
        { _id: id },
        { 
          $set: {
            ...data,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error(`Erro ao atualizar ${collectionName}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const collection = await getCollection(collectionName);
      const result = await collection.deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.error(`Erro ao deletar ${collectionName}:`, error);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const collection = await getCollection(collectionName);
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} por ID:`, error);
      throw error;
    }
  },

  findByFilter: async (filter) => {
    try {
      const collection = await getCollection(collectionName);
      return await collection.find(filter).toArray();
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} com filtro:`, error);
      throw error;
    }
  }
});

// Exportar operações para cada entidade
export const DepartmentOps = createEntityOperations('departments');
export const EventOps = createEntityOperations('events');
export const EventTypeOps = createEntityOperations('eventtypes');
export const TaskOps = createEntityOperations('tasks');
export const MaterialOps = createEntityOperations('materials');
export const SupplierOps = createEntityOperations('suppliers');
export const EventTaskOps = createEntityOperations('eventtasks');
export const EventMaterialOps = createEntityOperations('eventmaterials');
export const EventSupplierOps = createEntityOperations('eventsuppliers');
export const TaskCategoryOps = createEntityOperations('taskcategories');
export const MaterialCategoryOps = createEntityOperations('materialcategories');
export const SupplierCategoryOps = createEntityOperations('suppliercategories');

// Exemplo de uso (teste)
if (import.meta.url === `file://${process.argv[1]}`) {
  const testDatabase = async () => {
    try {
      // Listar todas as coleções
      const db = await connectDB();
      const collections = await db.listCollections().toArray();
      console.log('Coleções disponíveis:', collections.map(col => col.name));

      // Testar algumas operações
      console.log('Testando operações:');
      
      // Listar departamentos
      const departments = await DepartmentOps.list();
      console.log('Departamentos:', departments);

      // Listar eventos
      const events = await EventOps.list();
      console.log('Eventos:', events);

    } catch (error) {
      console.error('Erro ao testar o banco de dados:', error);
    } finally {
      await client.close();
    }
  };

  testDatabase();
} 