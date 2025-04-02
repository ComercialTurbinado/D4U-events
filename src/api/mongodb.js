// Adicionar console.log para depuração da URL
console.log('Variável de ambiente VITE_API_URL:', import.meta.env.VITE_API_URL);

export const API_URL = import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod/entities';

// Função auxiliar para limpar os dados antes de enviar para a API
export const cleanDataForApi = (data) => {
  if (!data) return {};
  
  console.log('Dados originais antes de limpar:', data);
  
  const cleanData = { ...data };
  // Remove campos internos do MongoDB
  delete cleanData._id;
  delete cleanData.__v;
  delete cleanData.createdAt;
  delete cleanData.updatedAt;
  
  // Se unit_cost ou total_cost forem 0, mantenha-os (não os apague)
  if (cleanData.unit_cost === 0 || cleanData.unit_cost) {
    cleanData.unit_cost = Number(cleanData.unit_cost);
  }
  
  if (cleanData.total_cost === 0 || cleanData.total_cost) {
    cleanData.total_cost = Number(cleanData.total_cost);
  }
  
  if (cleanData.quantity === 0 || cleanData.quantity) {
    cleanData.quantity = Number(cleanData.quantity);
  }
  
  console.log('Dados limpos para enviar à API:', cleanData);
  // Mantém os campos event_id e task_id
  return cleanData;
};

const createEntityOperations = (collection) => ({
  list: async () => {
    console.log(`Fazendo requisição GET para ${API_URL}/${collection}`);
    const response = await fetch(`${API_URL}/${collection}`);
    if (!response.ok) {
      console.error(`Erro na requisição GET ${collection}:`, response.status, response.statusText);
      throw new Error('Erro ao buscar dados');
    }
    const data = await response.json();
    console.log(`Dados retornados para ${collection}:`, data);
    return data;
  },

  get: async (id) => {
    console.log(`Fazendo requisição GET para ${API_URL}/${collection}/${id}`);
    const response = await fetch(`${API_URL}/${collection}/${id}`);
    if (!response.ok) {
      console.error(`Erro na requisição GET ${collection}/${id}:`, response.status, response.statusText);
      throw new Error('Erro ao buscar documento');
    }
    const data = await response.json();
    console.log(`Dados retornados para ${collection}/${id}:`, data);
    return data;
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
    console.log(`Atualizando ${collection}/${id} com dados:`, cleanData);
    
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });
    
    if (!response.ok) {
      console.error(`Erro ao atualizar ${collection}/${id}:`, response.status, response.statusText);
      throw new Error('Erro ao atualizar documento');
    }
    
    const result = await response.json();
    console.log(`Resposta da atualização ${collection}/${id}:`, result);
    return result;
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
export const TeamMemberOps = createEntityOperations('team-members'); 