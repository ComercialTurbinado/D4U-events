// Adicionar console.log para depuração da URL
console.log('Variável de ambiente VITE_API_URL:', import.meta.env.VITE_API_URL);

export const API_URL = (import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod') + '/entities';

console.log('API_URL final:', API_URL);

import { useState } from "react";
import PermissionAlert from "@/components/PermissionAlert";

// Função auxiliar para obter o token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token obtido do localStorage:', token ? 'Presente' : 'Ausente');
  if (token) {
    console.log('Token completo:', token);
    console.log('Tipo do token:', typeof token);
    console.log('Comprimento do token:', token.length);
  }
  return token;
};

// Função para criar os headers com o token
export const createHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Token de autenticação não encontrado');
  }
  
  // Verificar se o token é válido
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Token mal formatado');
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('Payload do token:', payload);
    
    // Verificar se o token expirou
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('Token expirado:', new Date(payload.exp * 1000));
      handleExpiredToken();
      throw new Error('Token expirado');
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    handleExpiredToken();
    throw error;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  console.log('Headers criados:', headers);
  return headers;
};

// Função para lidar com token expirado
const handleExpiredToken = () => {
  console.log('Token expirado, redirecionando para login...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_position');
  localStorage.removeItem('user_department_id');
  
  // Usar o React Router para navegação
  window.location.href = '/login';
};

// Função para verificar se o usuário tem permissão para modificar dados
const hasPermission = (data, operation) => {
  const usuarioLogado = JSON.parse(localStorage.getItem('user'));
  
  // Se não há usuário logado, não tem permissão
  if (!usuarioLogado) {
    return {
      hasPermission: false,
      alert: {
        type: 'permission',
        title: 'Acesso Negado',
        description: 'Você precisa estar autenticado para realizar esta operação'
      }
    };
  }
  
  // Se o usuário tem permissão de admin, pode fazer qualquer operação
  if (usuarioLogado.position && usuarioLogado.position.includes('admin')) {
    return { hasPermission: true };
  }
  
  // Se a operação é apenas leitura, verifica se tem permissão de visualização
  if (operation === 'read' && usuarioLogado.position) {
    return { hasPermission: true };
  }
  
    // Para operações de escrita, verifica se tem permissão de edição
    if (['create', 'update', 'delete'].includes(operation)) {
      const userPositions = Array.isArray(usuarioLogado.position)
        ? usuarioLogado.position
        : [usuarioLogado.position];

      const isAdmin = userPositions.includes('admin');
      const isEditor = userPositions.includes('editor') || userPositions.includes('edit');

      if (!isAdmin && !isEditor) {
        return {
          hasPermission: false,
          alert: {
            type: 'permission',
            title: 'Permissão Negada',
            description: 'Você não tem permissão para editar dados'
          }
        };
      }
    
    // Se tem permissão de edição, verifica se está editando dentro do seu departamento
    if (!isAdmin && data && data.department_id && usuarioLogado.department_id && 
        data.department_id !== usuarioLogado.department_id) {
      return {
        hasPermission: false,
        alert: {
          type: 'permission',
          title: 'Acesso Restrito',
          description: 'Você só pode editar dados do seu próprio departamento'
        }
      };
    }
    
    return { hasPermission: true };
  }
  
  // Por padrão, nega a permissão
  return {
    hasPermission: false,
    alert: {
      type: 'permission',
      title: 'Operação Negada',
      description: 'Você não tem permissão para realizar esta operação'
    }
  };
};

// Função auxiliar para adicionar o usuário ao body das requisições
const addUserToRequest = (data) => {
  // Recupera o usuário logado do localStorage
  const usuarioLogado = JSON.parse(localStorage.getItem('user'));
  
  if (!usuarioLogado) return data;
  
  return {
    ...data,
    // Inclui apenas dados relevantes do usuário
    usuario: {
      id: usuarioLogado.id,
      name: usuarioLogado.name,
      position: usuarioLogado.position || [],
      department_id: usuarioLogado.department_id
    }
  };
};

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

export const createEntityOperations = (collection) => ({
  list: async (sort) => {
    const url = `${API_URL}/${collection}${sort ? `?sort=${sort}` : ''}`;
    console.log(`Fazendo requisição GET para ${url}`);
    
    const headers = createHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`Erro na requisição GET ${collection}:`, response.status, response.statusText);
      if (response.status === 401) {
        handleExpiredToken();
      }
      throw new Error('Erro ao buscar dados');
    }
    const data = await response.json();
    console.log(`Dados retornados para ${collection}:`, data);
    return data;
  },

  get: async (id) => {
    const url = `${API_URL}/${collection}/${id}`;
    console.log(`Fazendo requisição GET para ${url}`);
    
    const headers = createHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`Erro na requisição GET ${collection}/${id}:`, response.status, response.statusText);
      if (response.status === 401) {
        handleExpiredToken();
      }
      throw new Error('Erro ao buscar documento');
    }
    const data = await response.json();
    console.log(`Dados retornados para ${collection}/${id}:`, data);
    return data;
  },

  create: async (data) => {
    const cleanData = cleanDataForApi(data);
    
    // Verifica se o usuário tem permissão para criar
    const { hasPermission: permissionResult, alert } = hasPermission(cleanData, 'create');
    
    if (!permissionResult) {
      throw alert;
    }
    
    // Adiciona o usuário ao body
    const dataWithUser = addUserToRequest(cleanData);
    
    const headers = createHeaders();
    const response = await fetch(`${API_URL}/${collection}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dataWithUser),
    });
    
    if (!response.ok) {
      console.error(`Erro na requisição POST ${collection}:`, response.status, response.statusText);
      if (response.status === 401) {
        handleExpiredToken();
      }
      throw new Error('Erro ao criar documento');
    }
    return response.json();
  },

  update: async (id, data) => {
    const cleanData = cleanDataForApi(data);
    
    // Verifica se o usuário tem permissão para atualizar
    const { hasPermission: permissionResult, alert } = hasPermission(cleanData, 'update');
    
    if (!permissionResult) {
      throw alert;
    }
    
    // Adiciona o usuário ao body
    const dataWithUser = addUserToRequest(cleanData);
    
    console.log(`Atualizando ${collection}/${id} com dados:`, dataWithUser);
    
    const headers = createHeaders();
    console.log('Headers da requisição:', headers);
    
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(dataWithUser),
    });
    
    if (!response.ok) {
      console.error(`Erro ao atualizar ${collection}/${id}:`, response.status, response.statusText);
      console.error('Resposta completa:', await response.text());
      if (response.status === 401) {
        handleExpiredToken();
      }
      throw new Error('Erro ao atualizar documento');
    }
    
    const result = await response.json();
    console.log(`Resposta da atualização ${collection}/${id}:`, result);
    return result;
  },

  delete: async (id) => {
    // Verifica se o usuário tem permissão para deletar
    // Para deletar, geralmente precisamos verificar o item antes para saber o departamento
    try {
      // Buscar o item diretamente em vez de usar this
      console.log(`Buscando item para verificar permissões de deleção: ${API_URL}/${collection}/${id}`);
      const response = await fetch(`${API_URL}/${collection}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      if (!response.ok) {
        throw new Error('Item não encontrado ou você não tem permissão para acessá-lo');
      }
      const item = await response.json();
      const { hasPermission: permissionResult, alert } = hasPermission(item, 'delete');
      if (!permissionResult) {
        throw alert;
      }
    } catch (error) {
      console.error(`Erro ao verificar permissão para deletar ${collection}/${id}:`, error);
      throw new Error('Você não tem permissão para deletar este item');
    }
    
    // Para DELETE, enviamos o usuário em um body vazio
    const userInfo = addUserToRequest({});
    
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify(userInfo),
    });
    if (!response.ok) throw new Error('Erro ao deletar documento');
    return response.json();
  },

  bulkCreate: async (items) => {
    const promises = items.map(item => {
      const cleanData = cleanDataForApi(item);
      
      // Verifica se o usuário tem permissão para criar cada item
      const { hasPermission: permissionResult, alert } = hasPermission(cleanData, 'create');
      
      if (!permissionResult) {
        throw alert;
      }
      
      // Adiciona o usuário ao body
      const dataWithUser = addUserToRequest(cleanData);
       
      return fetch(`${API_URL}/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify(dataWithUser),
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
export const TeamMemberOps = createEntityOperations('teammembers');
export const EventPromoterOps = createEntityOperations('event-promoters');
export const PromoterOps = createEntityOperations('promoters');

// Certifique-se de que a classe Entity é exportada
export class Entity {
  constructor(collection) {
    this.collection = collection;
  }

  async list(query = '') {
    try {
      const url = `${API_URL}/${this.collection}${query}`;
      console.log('URL da requisição:', url);
      
      const response = await fetch(url, {
        headers: createHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao listar ${this.collection}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao listar ${this.collection}:`, error);
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await fetch(`${API_URL}/${this.collection}/${id}`, {
        headers: createHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar ${this.collection}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar ${this.collection}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const cleanData = cleanDataForApi(data);
      const response = await fetch(`${API_URL}/${this.collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createHeaders()
        },
        body: JSON.stringify(cleanData)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao criar ${this.collection}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao criar ${this.collection}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const cleanData = cleanDataForApi(data);
      const response = await fetch(`${API_URL}/${this.collection}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createHeaders()
        },
        body: JSON.stringify(cleanData)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao atualizar ${this.collection}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar ${this.collection}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/${this.collection}/${id}`, {
        method: 'DELETE',
        headers: createHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao excluir ${this.collection}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao excluir ${this.collection}:`, error);
      throw error;
    }
  }
}

export class Event extends Entity {
  static collection = "events";
}

export class EventType extends Entity {
  static collection = "event-types";
}

export class Task extends Entity {
  static collection = "tasks";
}

export class Material extends Entity {
  static collection = "materials";
}

export class Supplier extends Entity {
  static collection = "suppliers";
}

export class EventTask extends Entity {
  static collection = "event-tasks";
}

export class EventMaterial extends Entity {
  static collection = "event-materials";
}

export class EventSupplier extends Entity {
  static collection = "event-suppliers";
}

export class EventInfluencer extends Entity {
  static collection = "event_influencers";

  static async list(filters = {}) {
    const data = await super.list(filters);
    
    // Popula os detalhes do influenciador
    const populatedData = await Promise.all(data.map(async (item) => {
      if (item.influencer_id) {
        const influencer = await Influencer.get(item.influencer_id);
        return { ...item, influencer };
      }
      return item;
    }));

    return populatedData;
  }

  static async get(id) {
    const data = await super.get(id);
    
    if (data && data.influencer_id) {
      const influencer = await Influencer.get(data.influencer_id);
      return { ...data, influencer };
    }
    
    return data;
  }
}

export class Influencer extends Entity {
  static collection = "influencers";
}

export class EventPromoter extends Entity {
  static collection = "event_promoters";

  static async list(filters = {}) {
    const data = await super.list(filters);
    
    // Popula os detalhes do promoter
    const populatedData = await Promise.all(data.map(async (item) => {
      if (item.promoter_id) {
        const promoter = await Promoter.get(item.promoter_id);
        return { ...item, promoter };
      }
      return item;
    }));

    return populatedData;
  }

  static async get(id) {
    const data = await super.get(id);
    
    if (data && data.promoter_id) {
      const promoter = await Promoter.get(data.promoter_id);
      return { ...data, promoter };
    }
    
    return data;
  }
}

export class Promoter extends Entity {
  static collection = "promoters";
}