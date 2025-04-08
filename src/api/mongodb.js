// Adicionar console.log para depuração da URL
console.log('Variável de ambiente VITE_API_URL:', import.meta.env.VITE_API_URL);

export const API_URL = import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod/entities';

import { useState } from "react";
import PermissionAlert from "@/components/PermissionAlert";

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
    // Verifica se tem permissão de edição
    if (!usuarioLogado.position || !usuarioLogado.position.includes('edit')) {
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
    if (data && data.department_id && usuarioLogado.department_id && 
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
    // Não verifica permissões para list para permitir login
    
    const url = `${API_URL}/${collection}${sort ? `?sort=${sort}` : ''}`;
    console.log(`Fazendo requisição GET para ${url}`);
    
    // Adicionar headers para evitar erros de CORS
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      credentials: 'include',
      mode: 'cors'
    });
    
    if (!response.ok) {
      console.error(`Erro na requisição GET ${collection}:`, response.status, response.statusText);
      throw new Error('Erro ao buscar dados');
    }
    const data = await response.json();
    console.log(`Dados retornados para ${collection}:`, data);
    return data;
  },

  get: async (id) => {
    // Não verifica permissões para get para permitir login
    
    console.log(`Fazendo requisição GET para ${API_URL}/${collection}/${id}`);
    
    // Adicionar headers para evitar erros de CORS
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      credentials: 'include',
      mode: 'cors'
    });
    
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
    
    // Verifica se o usuário tem permissão para criar
    const { hasPermission: permissionResult, alert } = hasPermission(cleanData, 'create');
    
    if (!permissionResult) {
      throw alert;
    }
    
    // Adiciona o usuário ao body
    const dataWithUser = addUserToRequest(cleanData);
    
    const response = await fetch(`${API_URL}/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(dataWithUser),
    });
    if (!response.ok) throw new Error('Erro ao criar documento');
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
    
    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(dataWithUser),
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
    // Verifica se o usuário tem permissão para deletar
    // Para deletar, geralmente precisamos verificar o item antes para saber o departamento
    try {
      // Buscar o item diretamente em vez de usar this
      console.log(`Buscando item para verificar permissões de deleção: ${API_URL}/${collection}/${id}`);
      const response = await fetch(`${API_URL}/${collection}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        credentials: 'include',
        mode: 'cors'
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
      credentials: 'include',
      mode: 'cors',
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
        credentials: 'include',
        mode: 'cors',
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