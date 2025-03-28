const mongoose = require('mongoose');

let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    cachedDb = connection;
    console.log('✅ Conexão com MongoDB estabelecida');
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
};

// Schemas
const eventTypeSchema = new mongoose.Schema({
  name: String,
  description: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskCategory' },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const materialSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialCategory' },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const supplierSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierCategory' },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const departmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  name: String,
  event_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType' },
  description: String,
  start_date: Date,
  end_date: Date,
  country: String,
  location: String,
  status: { 
    type: String, 
    enum: ['planning', 'in_progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  budget: Number,
  manager: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const eventTaskSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  assigned_to: String,
  due_date: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const eventMaterialSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  quantity: Number,
  unit: String,
  status: { 
    type: String, 
    enum: ['pending', 'ordered', 'received'],
    default: 'pending'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const eventSupplierSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  status: { 
    type: String, 
    enum: ['pending', 'contacted', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const taskCategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const materialCategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const supplierCategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Models
const models = {
  'event-types': mongoose.model('EventType', eventTypeSchema),
  'tasks': mongoose.model('Task', taskSchema),
  'materials': mongoose.model('Material', materialSchema),
  'suppliers': mongoose.model('Supplier', supplierSchema),
  'departments': mongoose.model('Department', departmentSchema),
  'events': mongoose.model('Event', eventSchema),
  'event-tasks': mongoose.model('EventTask', eventTaskSchema),
  'event-materials': mongoose.model('EventMaterial', eventMaterialSchema),
  'event-suppliers': mongoose.model('EventSupplier', eventSupplierSchema),
  'task-categories': mongoose.model('TaskCategory', taskCategorySchema),
  'material-categories': mongoose.model('MaterialCategory', materialCategorySchema),
  'supplier-categories': mongoose.model('SupplierCategory', supplierCategorySchema)
};

module.exports = {
  connectToDatabase,
  models
}; 
