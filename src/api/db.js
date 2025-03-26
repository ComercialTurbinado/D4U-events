const DB_NAME = 'd4u-events-db';
const DB_VERSION = 1;

// Lista de stores (tabelas) do banco de dados
const STORES = [
  'eventTypes',
  'defaultTasks',
  'defaultMaterials',
  'defaultSuppliers',
  'tasks',
  'materials',
  'suppliers',
  'departments',
  'events',
  'eventTasks',
  'eventMaterials',
  'eventSuppliers',
  'taskCategories',
  'materialCategories',
  'supplierCategories'
];

// Inicializa o banco de dados
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Cria as stores (tabelas)
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      });
    };
  });
};

// Função genérica para operações CRUD
const createStore = (storeName) => {
  return {
    list: async () => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    create: async (data) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    update: async (id, data) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put({ ...data, id });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    delete: async (id) => {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  };
};

// Exporta as entidades com as operações CRUD
export const EventType = createStore('eventTypes');
export const DefaultTask = createStore('defaultTasks');
export const DefaultMaterial = createStore('defaultMaterials');
export const DefaultSupplier = createStore('defaultSuppliers');
export const Task = createStore('tasks');
export const Material = createStore('materials');
export const Supplier = createStore('suppliers');
export const Department = createStore('departments');
export const Event = createStore('events');
export const EventTask = createStore('eventTasks');
export const EventMaterial = createStore('eventMaterials');
export const EventSupplier = createStore('eventSuppliers');
export const TaskCategory = createStore('taskCategories');
export const MaterialCategory = createStore('materialCategories');
export const SupplierCategory = createStore('supplierCategories');

// Mock auth (mantido para compatibilidade)
export const User = {
  login: () => Promise.resolve({}),
  logout: () => Promise.resolve({}),
  getCurrentUser: () => Promise.resolve({})
}; 


initDB