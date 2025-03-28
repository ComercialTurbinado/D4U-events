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
  name: { type: String, required: true },
  description: String,
  country: String,
  cost: Number,
  color: { type: String, default: "#3b82f6" },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskCategory' },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  estimated_time: Number,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialCategory' },
  unit: String,
  quantity: Number,
  price: Number,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierCategory' },
  contact_person: String,
  phone: String,
  email: String,
  country: String,
  state: String,
  city: String,
  address: String,
  service_description: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  manager: String,
  email: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  event_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType' },
  description: String,
  start_date: Date,
  end_date: Date,
  country: String,
  state: String,
  city: String,
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
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  assigned_to: String,
  due_date: Date,
  notes: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const eventMaterialSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  quantity: Number,
  unit: String,
  price: Number,
  status: { 
    type: String, 
    enum: ['pending', 'ordered', 'received'],
    default: 'pending'
  },
  notes: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const eventSupplierSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'contacted', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  price: Number,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const taskCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: { type: String, default: "#3b82f6" },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const materialCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: { type: String, default: "#3b82f6" },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const supplierCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: { type: String, default: "#3b82f6" },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const defaultTaskSchema = new mongoose.Schema({
  event_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType', required: true },
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  days_before_event: { type: Number, default: 7 },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const defaultMaterialSchema = new mongoose.Schema({
  event_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType', required: true },
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  default_quantity: { type: Number, default: 1 },
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
  'supplier-categories': mongoose.model('SupplierCategory', supplierCategorySchema),
  'default-tasks': mongoose.model('DefaultTask', defaultTaskSchema),
  'default-materials': mongoose.model('DefaultMaterial', defaultMaterialSchema)
};

module.exports = {
  connectToDatabase,
  models
}; 
