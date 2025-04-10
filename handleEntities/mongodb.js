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
  country:String,
  cost:Number,
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
  days_before_event: Number,
  responsible_role: String,
  is_required: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialCategory' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  storage_country: String,
  initial_purchase_quantity: Number,
  initial_purchase_cost: Number,
  default_quantity: Number,
  current_stock: Number,
  track_inventory: Boolean,
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
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  name: { type: String, required: true },
  description: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskCategory' },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  team_member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' },
  due_date: Date,
  notes: String,
  estimated_hours: { type: Number, default: 0 },
  actual_hours: { type: Number, default: 0 },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  days_before_event: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const eventMaterialSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'un' },
  unit_cost: { type: Number, default: 0 },
  total_cost: { type: Number, default: 0 },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  status: { 
    type: String, 
    enum: ['pending', 'ordered', 'received', 'cancelled'],
    default: 'pending'
  },
  delivery_date: Date,
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

const eventUTMSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  source: { type: String, default: 'evento' },
  medium: { type: String, default: 'qr_code' },
  campaign: { type: String, required: true },
  content: String,
  term: String,
  qr_code_url: String,
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


const taskCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: { type: String, default: "#3b82f6" },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Schema de Membros da Equipe
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  position: { type: String, required: true },
  whatsapp: String,
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = function globalPermissionMiddleware(schema) {
  schema.pre('save', function (next) {
    const doc = this;
    const user = doc._currentUser;

    if (!user) {
      return next(new Error('Usuário não autenticado'));
    }

    const positions = Array.isArray(user.position) ? user.position : [user.position];
    const isAdmin = positions.includes('admin');
    const isEditor = positions.includes('edit');
    const isReadOnly = positions.includes('read');

    if (isAdmin) return next();

    const modelName = this.constructor.modelName;

    if (isEditor) {
      if (['TeamMember', 'Department'].includes(modelName)) {
        return next(new Error('Você não tem permissão para editar membros ou departamentos.'));
      }
      return next();
    }

    if (isReadOnly && modelName === 'Task') {
      if (doc.department_id?.equals(user.department_id)) return next();
      return next(new Error('Você só pode editar tarefas do seu departamento.'));
    }

    return next(new Error('Você não tem permissão para editar.'));
  });
};


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
  'event-utms': mongoose.model('EventUTM', eventUTMSchema),
  'task-categories': mongoose.model('TaskCategory', taskCategorySchema),
  'material-categories': mongoose.model('MaterialCategory', materialCategorySchema),
  'supplier-categories': mongoose.model('SupplierCategory', supplierCategorySchema),
  'default-tasks': mongoose.model('DefaultTask', defaultTaskSchema),
  'default-materials': mongoose.model('DefaultMaterial', defaultMaterialSchema),
  'teammembers': mongoose.model('TeamMember', teamMemberSchema, 'teammembers')
};

module.exports = {
  connectToDatabase,
  models
}; 
