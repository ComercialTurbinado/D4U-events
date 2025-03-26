import {
  EventTypeOps as EventType,
  TaskOps as Task,
  MaterialOps as Material,
  SupplierOps as Supplier,
  DepartmentOps as Department,
  EventOps as Event,
  EventTaskOps as EventTask,
  EventMaterialOps as EventMaterial,
  EventSupplierOps as EventSupplier,
  TaskCategoryOps as TaskCategory,
  MaterialCategoryOps as MaterialCategory,
  SupplierCategoryOps as SupplierCategory,
  connectDB
} from './mongodb';

// Conecta ao MongoDB quando o arquivo é carregado
connectDB();

// Exporta as entidades
export {
  EventType,
  Task,
  Material,
  Supplier,
  Department,
  Event,
  EventTask,
  EventMaterial,
  EventSupplier,
  TaskCategory,
  MaterialCategory,
  SupplierCategory
};

// Mock auth (mantido para compatibilidade)
export const User = {
  login: () => Promise.resolve({}),
  logout: () => Promise.resolve({}),
  getCurrentUser: () => Promise.resolve({})
};