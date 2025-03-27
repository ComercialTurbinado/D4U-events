const API_URL = import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod/entities';

const createEntityOperations = (collection) => ({
  list: async () => {
    const response = await fetch(`${API_URL}/${collection}`);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao criar documento');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao atualizar documento');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar documento');
    return response.json();
  },
});

// Exporta as operações para cada entidade
export const EventTypeOps = createEntityOperations('event-types');
export const TaskOps = createEntityOperations('tasks');
export const MaterialOps = createEntityOperations('materials');
export const SupplierOps = createEntityOperations('suppliers');
export const DepartmentOps = createEntityOperations('departments');
export const EventOps = createEntityOperations('events');
export const EventTaskOps = createEntityOperations('event-tasks');
export const EventMaterialOps = createEntityOperations('event-materials');
export const EventSupplierOps = createEntityOperations('event-suppliers');
export const TaskCategoryOps = createEntityOperations('task-categories');
export const MaterialCategoryOps = createEntityOperations('material-categories');
export const SupplierCategoryOps = createEntityOperations('supplier-categories'); 