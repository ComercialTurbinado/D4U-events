import { EventTypeOps, TaskOps, MaterialOps, SupplierOps, DepartmentOps, EventOps, EventTaskOps, EventMaterialOps, EventSupplierOps, TaskCategoryOps, MaterialCategoryOps, SupplierCategoryOps } from './mongodb';
import { API_URL, cleanDataForApi } from './mongodb';

// Mock entities para desenvolvimento
export const EventType = EventTypeOps;

export const DefaultTask = {
  list: async () => {
    const response = await fetch(`${API_URL}/default-tasks`);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return response.json();
  },
  create: async (data) => {
    const cleanData = cleanDataForApi(data);
    const response = await fetch(`${API_URL}/default-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });
    if (!response.ok) throw new Error('Erro ao criar documento');
    return response.json();
  },
  update: async (id, data) => {
    const cleanData = cleanDataForApi(data);
    const response = await fetch(`${API_URL}/default-tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });
    if (!response.ok) throw new Error('Erro ao atualizar documento');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/default-tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar documento');
    return response.json();
  },
  bulkCreate: async (items) => {
    const promises = items.map(item => DefaultTask.create(item));
    return Promise.all(promises);
  }
};

export const DefaultMaterial = {
  list: async () => {
    const response = await fetch(`${API_URL}/default-materials`);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return response.json();
  },
  create: async (data) => {
    const cleanData = cleanDataForApi(data);
    const response = await fetch(`${API_URL}/default-materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });
    if (!response.ok) throw new Error('Erro ao criar documento');
    return response.json();
  },
  update: async (id, data) => {
    const cleanData = cleanDataForApi(data);
    const response = await fetch(`${API_URL}/default-materials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });
    if (!response.ok) throw new Error('Erro ao atualizar documento');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/default-materials/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar documento');
    return response.json();
  },
  bulkCreate: async (items) => {
    const promises = items.map(item => DefaultMaterial.create(item));
    return Promise.all(promises);
  }
};

export const DefaultSupplier = {
  list: () => Promise.resolve([]),
  create: () => Promise.resolve({}),
  update: () => Promise.resolve({}),
  delete: () => Promise.resolve({})
};

export const Task = TaskOps;
export const Material = MaterialOps;
export const Supplier = SupplierOps;
export const Department = DepartmentOps;
export const Event = EventOps;
export const EventTask = EventTaskOps;
export const EventMaterial = EventMaterialOps;
export const EventSupplier = EventSupplierOps;
export const TaskCategory = TaskCategoryOps;
export const MaterialCategory = MaterialCategoryOps;
export const SupplierCategory = SupplierCategoryOps;

// Mock auth
export const User = {
  login: () => Promise.resolve({}),
  logout: () => Promise.resolve({}),
  getCurrentUser: () => Promise.resolve({})
};