import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // evita travar indefinidamente
    });

    isConnected = true;
    console.log("✅ MongoDB conectado com sucesso via Mongoose!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error.message);
  }
};


  // Schemas
  const eventTypeSchema = new mongoose.Schema({
    name: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
  });

  const taskSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskCategory' },
    createdAt: { type: Date, default: Date.now }
  });

  const materialSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialCategory' },
    createdAt: { type: Date, default: Date.now }
  });

  const supplierSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierCategory' },
    contact: String,
    email: String,
    phone: String,
    createdAt: { type: Date, default: Date.now }
  });

  const departmentSchema = new mongoose.Schema({
    name: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
  });

  const eventSchema = new mongoose.Schema({
    name: String,
    description: String,
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType' },
    startDate: Date,
    endDate: Date,
    status: String,
    createdAt: { type: Date, default: Date.now }
  });

  const eventTaskSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    status: String,
    startDate: Date,
    endDate: Date,
    createdAt: { type: Date, default: Date.now }
  });

  const eventMaterialSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    quantity: Number,
    createdAt: { type: Date, default: Date.now }
  });

  const eventSupplierSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    service: String,
    cost: Number,
    createdAt: { type: Date, default: Date.now }
  });

  const taskCategorySchema = new mongoose.Schema({
    name: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
  });

  const materialCategorySchema = new mongoose.Schema({
    name: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
  });

  const supplierCategorySchema = new mongoose.Schema({
    name: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
  });

  // Models
  export const EventType = (mongoose.models && mongoose.models.EventType) || mongoose.model('EventType', eventTypeSchema);
  export const Task = (mongoose.models && mongoose.models.Task) || mongoose.model('Task', taskSchema);
  export const Material = (mongoose.models && mongoose.models.Material) || mongoose.model('Material', materialSchema);
  export const Supplier = (mongoose.models && mongoose.models.Supplier) || mongoose.model('Supplier', supplierSchema);
  export const Department = (mongoose.models && mongoose.models.Department) || mongoose.model('Department', departmentSchema); 
  export const Event = (mongoose.models && mongoose.models.Event) || mongoose.model('Event', eventSchema);
  export const EventTask = (mongoose.models && mongoose.models.EventTask) || mongoose.model('EventTask', eventTaskSchema);
  export const EventMaterial = (mongoose.models && mongoose.models.EventMaterial) || mongoose.model('EventMaterial', eventMaterialSchema);
  export const EventSupplier = (mongoose.models && mongoose.models.EventSupplier) || mongoose.model('EventSupplier', eventSupplierSchema);
  export const TaskCategory = (mongoose.models && mongoose.models.TaskCategory) || mongoose.model('TaskCategory', taskCategorySchema);
  export const MaterialCategory = (mongoose.models && mongoose.models.MaterialCategory) || mongoose.model('MaterialCategory', materialCategorySchema);
  export const SupplierCategory = (mongoose.models && mongoose.models.SupplierCategory) || mongoose.model('SupplierCategory', supplierCategorySchema);

  // Funções auxiliares para CRUD
  const createCRUDOperations = (Model) => ({
    list: () => Model.find(),
    create: (data) => new Model(data).save(),
    update: (id, data) => Model.findByIdAndUpdate(id, data, { new: true }),
    delete: (id) => Model.findByIdAndDelete(id)
  });

  // Exporta as operações CRUD para cada modelo
  export const EventTypeOps = createCRUDOperations(EventType);
  export const TaskOps = createCRUDOperations(Task);
  export const MaterialOps = createCRUDOperations(Material);
  export const SupplierOps = createCRUDOperations(Supplier);
  export const DepartmentOps = createCRUDOperations(Department);
  export const EventOps = createCRUDOperations(Event);
  export const EventTaskOps = createCRUDOperations(EventTask);
  export const EventMaterialOps = createCRUDOperations(EventMaterial);
  export const EventSupplierOps = createCRUDOperations(EventSupplier);
  export const TaskCategoryOps = createCRUDOperations(TaskCategory);
  export const MaterialCategoryOps = createCRUDOperations(MaterialCategory);
  export const SupplierCategoryOps = createCRUDOperations(SupplierCategory); 

  connectDB();