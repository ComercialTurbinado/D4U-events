import React, { useState, useEffect } from "react";
import { EventTask, Task, DefaultTask, TaskCategory, Department } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import EventTaskForm from "./EventTaskForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventTasksTab({ eventId, eventTypeId, eventData }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [availableTypeTasks, setAvailableTypeTasks] = useState([]);
  const [typeTasks, setTypeTasks] = useState([]);
  const [departmentMap, setDepartmentMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadTasks();
    loadCategories();
    loadDepartments();
  }, [eventId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      console.log('EventTasksTab - Carregando tarefas do evento:', eventId);
      
      // 1. Primeiro carregar todas as tarefas base
      const allTasks = await Task.list({
        populate: [
          { path: 'category_id', select: 'name department_id' },
          { path: 'department_id', select: 'name' }
        ]
      });
      console.log('EventTasksTab - Tarefas base carregadas:', allTasks);
      setAvailableTasks(allTasks);
      
      // 2. Carregar todas as categorias
      const allCategories = await TaskCategory.list({
        populate: [{ path: 'department_id', select: 'name' }]
      });
      console.log('EventTasksTab - Categorias carregadas:', allCategories);
      
      // 3. Carregar todos os departamentos
      const allDepartments = await Department.list();
      console.log('EventTasksTab - Departamentos carregados:', allDepartments);
      
      // 4. Carregar as tarefas do evento
      const eventTasks = await EventTask.list({
        populate: [
          { path: 'task_id', select: 'name description category_id department_id' },
          { path: 'category_id', select: 'name color department_id' },
          { path: 'department_id', select: 'name' },
          { path: 'team_member_id', select: 'name role' }
        ]
      });
      
      // 5. Filtrar tarefas para o evento atual
      const filteredTasks = eventTasks.filter(task => task.event_id === eventId);
      console.log('EventTasksTab - Tarefas filtradas para o evento:', filteredTasks);
      
      // 6. Enriquecer dados das tarefas
      const enrichedTasks = filteredTasks.map(task => {
        console.log(`\n---- Processando tarefa: ${task.name} ----`);
        console.log('Dados originais da tarefa:', {
          id: task.id || task._id,
          task_id: task.task_id,
          department_id: task.department_id,
          category_id: task.category_id
        });
        
        // 6.1 Buscar informações da tarefa original e categoria
        let originalTask = null;
        let category = null;
        let categoryName = null;
        let categoryId = null;
        
        // Primeiro localizar a categoria
        if (task.category_id) {
          categoryId = typeof task.category_id === 'object' ? task.category_id._id : task.category_id;
          category = typeof task.category_id === 'object' ? task.category_id :
                   allCategories.find(c => c.id === categoryId || c._id === categoryId);
          
          if (category) {
            categoryName = category.name;
            console.log('Categoria encontrada diretamente na tarefa do evento:', categoryName);
          }
        }
        
        // Buscar a tarefa original
        if (task.task_id) {
          const taskId = typeof task.task_id === 'object' ? task.task_id._id : task.task_id;
          originalTask = allTasks.find(t => t.id === taskId || t._id === taskId);
          if (originalTask) {
            console.log('Tarefa original encontrada:', {
              id: originalTask.id,
              name: originalTask.name,
              department_id: originalTask.department_id,
              category_id: originalTask.category_id
            });
            
            // Se não temos categoria ainda, buscar da tarefa original
            if (!category && originalTask.category_id) {
              categoryId = typeof originalTask.category_id === 'object' ? originalTask.category_id._id : originalTask.category_id;
              category = typeof originalTask.category_id === 'object' ? originalTask.category_id :
                       allCategories.find(c => c.id === categoryId || c._id === categoryId);
              
              if (category) {
                categoryName = category.name;
                console.log('Categoria encontrada via tarefa original:', categoryName);
              }
            }
          }
        }
        
        // 6.2 Determinar o departamento - prioridade para o ID
        let department = null;
        let departmentName = null;
        let departmentId = null;
        
        // a) Buscar pelo department_id direto da tarefa
        if (task.department_id) {
          departmentId = typeof task.department_id === 'object' ? task.department_id._id : task.department_id;
          department = allDepartments.find(d => d.id === departmentId || d._id === departmentId);
          
          if (department) {
            departmentName = department.name;
            console.log(`Tarefa ${task.name}: Departamento encontrado pelo ID:`, departmentName);
          }
        }
        
        // b) Se não encontrou departamento, verificar na tarefa original
        if (!departmentId && task.task_id) {
          const taskId = typeof task.task_id === 'object' ? task.task_id._id : task.task_id;
          const originalTask = allTasks.find(t => t.id === taskId || t._id === taskId);
          
          if (originalTask && originalTask.department_id) {
            departmentId = typeof originalTask.department_id === 'object' ? 
                           originalTask.department_id._id : 
                           originalTask.department_id;
            department = allDepartments.find(d => d.id === departmentId || d._id === departmentId);
            
            if (department) {
              departmentName = department.name;
              console.log(`Tarefa ${task.name}: Departamento encontrado via tarefa original:`, departmentName);
            }
          }
        }
        
        // c) Último recurso: usar qualquer departamento disponível
        if (!departmentId && allDepartments.length > 0) {
          department = allDepartments[0];
          departmentId = department.id || department._id;
          departmentName = department.name;
          console.log(`Tarefa ${task.name}: Usando primeiro departamento disponível:`, departmentName);
        }
        
        // 6.4 Verificar urgência da tarefa
        let isUrgent = false;
        let isLate = false;
        
        if (task.due_date) {
          const now = new Date();
          const dueDate = new Date(task.due_date);
          
          // Verificar se a data já passou
          if (dueDate < now) {
            isLate = true;
            isUrgent = true;
          } else {
            // Verificar se está próximo do prazo (menos de 3 dias)
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(now.getDate() + 3);
            if (dueDate <= threeDaysFromNow) {
              isUrgent = true;
            }
          }
        }
        
        // 6.5 Se não encontrou departamento ou categoria, registrar aviso
        if (!departmentId) {
          console.warn(`Tarefa ${task.name}: ALERTA - Não foi possível encontrar um departamento!`);
          
          // Última tentativa: tentar encontrar qualquer departamento
          if (allDepartments.length > 0) {
            department = allDepartments[0];
            departmentId = department.id || department._id;
            departmentName = department.name;
            console.log('Usando primeiro departamento disponível:', departmentName);
          }
        }
        
        if (!categoryId) {
          console.warn(`Tarefa ${task.name}: ALERTA - Não foi possível encontrar uma categoria!`);
          
          // Se temos departamento, procurar uma categoria compatível
          if (departmentId && !categoryId) {
            const compatibleCategory = allCategories.find(c => {
              const catDeptId = typeof c.department_id === 'object' ? c.department_id._id : c.department_id;
              return catDeptId === departmentId;
            });
            
            if (compatibleCategory) {
              category = compatibleCategory;
              categoryId = compatibleCategory.id || compatibleCategory._id;
              categoryName = compatibleCategory.name;
              console.log('Categoria compatível encontrada para o departamento:', categoryName);
            }
          }
        }
        
        console.log('Resultado final do processamento:', {
          name: task.name,
          departmentId,
          departmentName,
          categoryId,
          categoryName
        });
        
        // 6.6 Retornar tarefa enriquecida
        return {
          ...task,
          department_id: departmentId,
          department_name: departmentName,
          category_id: categoryId,
          category_name: categoryName,
          isUrgent,
          isLate
        };
      });
      
      console.log('EventTasksTab - Tarefas enriquecidas:', enrichedTasks);
      setTasks(enrichedTasks);
    } catch (error) {
      console.error('EventTasksTab - Erro ao carregar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultTasks = async () => {
    try {
      const defaultTasks = await DefaultTask.list();
      const allTasks = await Task.list();
      
      const enrichedTasks = defaultTasks
        .filter(t => t.event_type_id === eventTypeId)
        .filter(t => t.task_id)
        .map(t => ({
          ...t,
          task: allTasks.find(at => at.id === t.task_id)
        }));

      setTypeTasks(enrichedTasks);
    } catch (error) {
      console.error("Error loading default tasks:", error);
    }
  };

  const loadDepartments = async () => {
    try {
      const allDepartments = await Department.list();
      console.log('EventTasksTab - Departamentos carregados:', allDepartments);
      setDepartments(allDepartments);
      
      // Criar mapa de ID para nome do departamento
      const deptMap = {};
      allDepartments.forEach(dept => {
        deptMap[dept.id] = dept.name;
      });
      setDepartmentMap(deptMap);
      
      return allDepartments;
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      return [];
    }
  };

  const handleCreateTask = async (taskData) => {
    console.log('EventTasksTab - Criando nova tarefa, dados recebidos:', taskData);
    
    try {
      // Limpar os dados antes de enviar para a API
      const cleanedData = { ...taskData, event_id: eventId };
      
      // Se não tiver departamento ou categoria, enviar null em vez de string vazia
      if (!cleanedData.department_id) cleanedData.department_id = null;
      if (!cleanedData.category_id) cleanedData.category_id = null;
      
      console.log('Dados originais antes de limpar:', taskData);
      console.log('Dados limpos para enviar à API:', cleanedData);
      
      // Criar a tarefa
      const result = await EventTask.create(cleanedData);
      console.log('EventTasksTab - Tarefa criada com sucesso:', result);
      
      // Recarregar tarefas
      await loadTasks();
      
      return result;
    } catch (error) {
      console.error('EventTasksTab - Erro ao criar tarefa:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      console.log('EventTasksTab - Atualizando tarefa:', id, taskData);
      
      // Garantir que o departamento está definido
      if (taskData.category_id && !taskData.department_id) {
        // Carregar categorias para obter o departamento
        const allCategories = await TaskCategory.list({
          populate: [{ path: 'department_id', select: 'name' }]
        });
        
        // Buscar a categoria selecionada
        const selectedCategory = allCategories.find(
          c => c.id === taskData.category_id || c._id === taskData.category_id
        );
        
        // Extrair o departamento da categoria
        if (selectedCategory && selectedCategory.department_id) {
          taskData.department_id = typeof selectedCategory.department_id === 'object' ?
                                  selectedCategory.department_id._id :
                                  selectedCategory.department_id;
          console.log('EventTasksTab - Definindo departamento a partir da categoria:', taskData.department_id);
        }
      }
      
      // Dados básicos da tarefa - formato MongoDB
      const updateData = {
        name: taskData.name || "",
        description: taskData.description || "",
        task_id: taskData.task_id || null,
        category_id: taskData.category_id || null,
        department_id: taskData.department_id || null,
        team_member_id: taskData.team_member_id || null,
        status: taskData.status || "pending",
        due_date: taskData.due_date || null,
        notes: taskData.notes || "",
        priority: taskData.priority || "medium",
        estimated_hours: taskData.estimated_hours || 0,
        is_active: true
      };
      
      console.log('EventTasksTab - Dados formatados para atualizar tarefa:', updateData);
      const updatedTask = await EventTask.update(id, updateData);
      console.log('EventTasksTab - Tarefa atualizada:', updatedTask);
      
      setShowForm(false);
      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      console.error('EventTasksTab - Erro ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    await EventTask.delete(id);
    loadTasks();
  };

  const handleEdit = (task) => {
    console.log('EventTasksTab - Editando tarefa:', task);
    
    const formData = {
      id: task.id || task._id,
      name: task.name,
      description: task.description,
      task_id: task.task_id?._id || task.task_id || null,
      department_id: task.department_id?._id || task.department_id || null,
      category_id: task.category_id?._id || task.category_id || null,
      team_member_id: task.team_member_id?._id || task.team_member_id || null,
      due_date: task.due_date || null,
      status: task.status || "pending",
      priority: task.priority || "medium",
      notes: task.notes || "",
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0,
      days_before_event: task.days_before_event || 0
    };
    
    console.log('EventTasksTab - Dados formatados para edição:', formData);
    setEditingTask(formData);
    setShowForm(true);
  };

  const handleImportFromEventType = async () => {
    if (!eventTypeId) {
      console.log('EventTasksTab - eventTypeId não disponível');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('EventTasksTab - Iniciando importação de tarefas do tipo:', eventTypeId);
      
      // Carregar tarefas padrão do tipo de evento
      const defaultTasks = await DefaultTask.list();
      console.log('EventTasksTab - Tarefas padrão:', defaultTasks);
      
      const tasksToImport = defaultTasks.filter(dt => dt.event_type_id === eventTypeId);
      console.log('EventTasksTab - Tarefas filtradas para importar:', tasksToImport);
      
      // Carregar todas as tarefas disponíveis
      const allTasks = await Task.list({
        populate: [
          { path: 'category_id', select: 'name department_id' },
          { path: 'department_id', select: 'name' }
        ]
      });
      console.log('EventTasksTab - Todas as tarefas:', allTasks);
      
      // Carregar todas as categorias para obter os departamentos
      const allCategories = await TaskCategory.list({
        populate: [{ path: 'department_id', select: 'name' }]
      });
      console.log('EventTasksTab - Todas as categorias:', allCategories);
      
      // Carregar tarefas existentes do evento
      const eventTasks = await EventTask.list();
      console.log('EventTasksTab - Tarefas do evento:', eventTasks);
      
      const existingTasks = eventTasks.filter(et => et.event_id === eventId);
      console.log('EventTasksTab - Tarefas existentes filtradas:', existingTasks);
      
      for (const defaultTask of tasksToImport) {
        try {
          console.log('EventTasksTab - Processando tarefa:', defaultTask);
          
          // Verificar se a tarefa já existe no evento
          const existingTask = existingTasks.find(et => et.task_id === defaultTask.task_id);
          console.log('EventTasksTab - Tarefa existente:', existingTask);
          
          // Buscar detalhes da tarefa base
          const taskDetails = allTasks.find(t => t.id === defaultTask.task_id);
          if (!taskDetails) {
            console.log('EventTasksTab - Tarefa base não encontrada:', defaultTask.task_id);
            continue;
          }
          console.log('EventTasksTab - Detalhes da tarefa base:', taskDetails);
          
          // Determinar o departamento
          let departmentId = null;
          let categoryId = null;
          
          // 1. Verificar categoria da tarefa
          if (taskDetails.category_id) {
            // Extrair ID da categoria
            categoryId = typeof taskDetails.category_id === 'object' ? 
                          taskDetails.category_id._id : 
                          taskDetails.category_id;
            console.log('Category ID extraído:', categoryId);
            
            // Buscar categoria completa para obter departamento
            const category = typeof taskDetails.category_id === 'object' ? 
                            taskDetails.category_id :
                            allCategories.find(c => c.id === categoryId || c._id === categoryId);
            
            if (category) {
              console.log('Categoria encontrada:', category);
              // Verificar se categoria tem departamento
              if (category.department_id) {
                departmentId = typeof category.department_id === 'object' ? 
                              category.department_id._id : 
                              category.department_id;
                console.log('Departamento encontrado via categoria:', departmentId);
              }
            }
          }
          
          // 2. Se não encontrou departamento via categoria, verificar departamento direto
          if (!departmentId && taskDetails.department_id) {
            departmentId = typeof taskDetails.department_id === 'object' ? 
                          taskDetails.department_id._id : 
                          taskDetails.department_id;
            console.log('Departamento encontrado diretamente:', departmentId);
          }
          
          // 3. Se ainda não temos departamento e temos categoria, tentar encontrar o departamento via allCategories
          if (!departmentId && categoryId) {
            const categoryObj = allCategories.find(c => c.id === categoryId || c._id === categoryId);
            if (categoryObj && categoryObj.department_id) {
              departmentId = typeof categoryObj.department_id === 'object' ? 
                            categoryObj.department_id._id : 
                            categoryObj.department_id;
              console.log('Departamento encontrado via busca em allCategories:', departmentId);
            }
          }
          
          // 4. Último recurso: selecionar qualquer departamento disponível
          if (!departmentId && allCategories.length > 0) {
            const anyCategory = allCategories.find(c => c.department_id);
            if (anyCategory) {
              departmentId = typeof anyCategory.department_id === 'object' ? 
                            anyCategory.department_id._id : 
                            anyCategory.department_id;
              console.log('Usando departamento de uma categoria qualquer:', departmentId);
              
              // Se não tínhamos categoria, usar esta
              if (!categoryId) {
                categoryId = anyCategory.id || anyCategory._id;
              }
            }
          }
          
          // Dados básicos da tarefa - formato MongoDB
          const taskData = {
            event_id: eventId,
            task_id: defaultTask.task_id,
            name: taskDetails.name || "Tarefa sem nome",
            description: taskDetails.description || "",
            category_id: categoryId,
            department_id: departmentId, // Adicionando o department_id explicitamente
            team_member_id: null,
            status: "pending",
            due_date: null,
            notes: taskDetails.notes || "",
            priority: taskDetails.priority || "medium",
            estimated_hours: taskDetails.estimated_hours || 0,
            actual_hours: 0,
            is_active: true
          };
          
          console.log('EventTasksTab - Dados da tarefa para criar/atualizar:', taskData);
          
          if (existingTask) {
            // Atualizar tarefa existente
            const updatedTask = await EventTask.update(existingTask.id, taskData);
            console.log('EventTasksTab - Tarefa atualizada:', updatedTask);
          } else {
            // Criar nova tarefa
            const createdTask = await EventTask.create(taskData);
            console.log('EventTasksTab - Nova tarefa criada:', createdTask);
          }
        } catch (error) {
          console.error('EventTasksTab - Erro ao processar tarefa:', defaultTask, error);
          // Continuar com a próxima tarefa mesmo se houver erro
          continue;
        }
      }
      
      // Recarregar as tarefas do evento
      await loadTasks();
    } catch (error) {
      console.error("EventTasksTab - Erro ao importar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log('EventTasksTab - Alterando status da tarefa:', taskId, newStatus);
      
      await EventTask.update(taskId, { 
        status: newStatus 
      });
      
      console.log('EventTasksTab - Status atualizado com sucesso');
      await loadTasks();
    } catch (error) {
      console.error('EventTasksTab - Erro ao alterar status:', error);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "Pendente",
      in_progress: "Em Andamento",
      completed: "Concluída"
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  
  const getCategoryLabel = (category) => {
    const categoryMap = {
      design: "Design",
      logistics: "Logística",
      suppliers: "Fornecedores",
      media: "Mídia",
      other: "Outros"
    };
    return categoryMap[category] || category;
  };

  const handleTaskSelect = (taskId) => {
    const selectedTask = availableTasks.find(task => task.id === taskId);
    
    if (selectedTask) {
      // Extrair o department_id diretamente da tarefa
      let departmentId = null;
      
      if (selectedTask.department_id) {
        departmentId = typeof selectedTask.department_id === 'object' ? 
                       selectedTask.department_id._id : 
                       selectedTask.department_id;
      }
      
      // Atualizar formulário garantindo que o department_id seja salvo
      setFormData({
        ...formData,
        task_id: taskId,
        name: selectedTask.name,
        description: selectedTask.description || "",
        department_id: departmentId, // Usar ID diretamente
        // ... outros campos
      });
    }
  };

  const recadastrarTarefasExistentes = async () => {
    try {
      // 1. Carregar todas as tarefas existentes
      const todasTarefas = await EventTask.list();
      
      // 2. Carregar todos os departamentos
      const todosDepartamentos = await Department.list();
      
      // 3. Atualizar cada tarefa
      for (const tarefa of todasTarefas) {
        // Ignorar se já tem department_id
        if (tarefa.department_id) continue;
        
        // Tentar encontrar o department_id
        let departmentId = null;
        
        // a) Verificar o campo responsible_role que contém o nome do departamento
        if (tarefa.responsible_role) {
          const departamento = todosDepartamentos.find(
            d => d.name.toLowerCase() === tarefa.responsible_role.toLowerCase()
          );
          
          if (departamento) {
            departmentId = departamento.id || departamento._id;
          }
        }
        
        // b) Se não achou, verificar a tarefa original
        if (!departmentId && tarefa.task_id) {
          // Código para buscar departamento pela tarefa original
        }
        
        // c) Se ainda não achou, usar o primeiro departamento disponível
        if (!departmentId && todosDepartamentos.length > 0) {
          departmentId = todosDepartamentos[0].id || todosDepartamentos[0]._id;
        }
        
        // Atualizar a tarefa com o department_id
        if (departmentId) {
          await EventTask.update(tarefa.id, {
            ...tarefa,
            department_id: departmentId
          });
          console.log(`Tarefa ${tarefa.name} atualizada com department_id: ${departmentId}`);
        }
      }
      
      console.log("Todas as tarefas foram atualizadas com department_id.");
    } catch (error) {
      console.error("Erro ao recadastrar tarefas:", error);
    }
  };

  const getCategoryName = (task) => {
    if (!task.category_id) return "Não definida";
    
    // Se já temos o objeto completo
    if (typeof task.category_id === 'object' && task.category_id?.name) {
      return task.category_id.name;
    }
    
    // Se só temos o ID, buscar nas categorias carregadas
    const category = categories.find(c => c.id === task.category_id);
    if (category) {
      return category.name;
    }
    
    // Se não encontrar nas categorias, buscar nas tarefas disponíveis
    const taskWithCategory = availableTasks.find(t => 
      t.category_id && (
        (typeof t.category_id === 'object' && t.category_id._id === task.category_id) ||
        t.category_id === task.category_id
      )
    );
    
    if (taskWithCategory && typeof taskWithCategory.category_id === 'object') {
      return taskWithCategory.category_id.name;
    }
    
    return "Categoria não encontrada";
  };

  const getDepartmentName = (task) => {
    if (!task.department_id) return "Não definido";
    
    // Se já temos o objeto completo
    if (typeof task.department_id === 'object' && task.department_id?.name) {
      return task.department_id.name;
    }
    
    // Usar o mapa de departamentos para buscar o nome
    if (departmentMap[task.department_id]) {
      return departmentMap[task.department_id];
    }
    
    // Se não encontrar no mapa, buscar nos departamentos carregados
    const department = departments.find(d => d.id === task.department_id);
    if (department) {
      return department.name;
    }
    
    return "Setor não encontrado";
  };

  const loadCategories = async () => {
    try {
      const allCategories = await TaskCategory.list();
      console.log('EventTasksTab - Categorias carregadas:', allCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]);
    }
  };

  return (
    <div className="space-y-4">
      {showForm && (
        <EventTaskForm
          initialData={editingTask}
          availableTasks={availableTasks}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          eventId={eventId}
          eventDate={eventData?.start_date || null}
        />
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tarefas do Evento</h2>
        <div className="flex gap-2">
          {eventTypeId && (
            <Button
              onClick={handleImportFromEventType}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              Importar do Tipo de Evento
            </Button>
          )}
          <Button 
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Setor</TableHead>  
              <TableHead>Categoria</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data Limite</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Nenhuma tarefa cadastrada
                </TableCell>
              </TableRow>
            ) : (
              tasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.department_name || getDepartmentName(task)}</TableCell>
                  <TableCell>{task.category_name || getCategoryName(task)}</TableCell>
                  <TableCell>{task.team_member_id?.name || "-"}</TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <div className="flex items-center gap-1">
                        <span className={task.isUrgent ? "text-red-600 font-medium" : ""}>
                          {format(new Date(task.due_date), "dd/MM/yyyy")}
                        </span>
                        {task.isUrgent && (
                          <Badge variant="destructive" className="ml-1 flex items-center gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            {task.isLate ? "ATRASADO" : "URGENTE"}
                          </Badge>
                        )}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(task)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(task.id, task.status === "completed" ? "pending" : "completed")}
                        disabled={isLoading}
                      >
                        <CheckCircle className={`h-4 w-4 ${task.status === "completed" ? "text-green-500" : "text-gray-400"}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}