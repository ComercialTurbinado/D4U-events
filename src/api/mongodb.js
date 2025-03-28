const API_URL = import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod/entities';

// Função auxiliar para limpar os dados antes de enviar para a API
const cleanDataForApi = (data) => {
  const cleanData = { ...data };
  // Remove campos internos do MongoDB
  delete cleanData._id;
  delete cleanData.__v;
  delete cleanData.createdAt;
  delete cleanData.updatedAt;
  // Mantém os campos event_id e task_id
  return cleanData;
};

const createEntityOperations = (collection) => ({
  list: async () => {
    const response = await fetch(`${API_URL}/${collection}`);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return response.json();
  },

  get: async (id) => {
    const response = await fetch(`${API_URL}/${collection}/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar documento');
    return response.json();
  },

  create: async (data) => {
    const cleanData = cleanDataForApi(data);
    const response = await fetch(`${API_URL}/${collection}`, {
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
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
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
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar documento');
    return response.json();
  },

  bulkCreate: async (items) => {
    const promises = items.map(item => {
      const cleanData = cleanDataForApi(item);
      return fetch(`${API_URL}/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      }).then(response => {
        if (!response.ok) throw new Error('Erro ao criar documento');
        return response.json();
      });
    });
    return Promise.all(promises);
  }
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
export const DefaultTaskOps = createEntityOperations('default-tasks');
export const DefaultMaterialOps = createEntityOperations('default-materials');
export const DefaultSupplierOps = createEntityOperations('default-suppliers');

export { API_URL, cleanDataForApi }; 