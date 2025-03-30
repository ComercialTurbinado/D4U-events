import React, { useState, useEffect } from "react";
import { EventTask, Task, DefaultTask } from "@/api/entities";
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

  useEffect(() => {
    loadTasks();
  }, [eventId]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      console.log('EventTasksTab - Iniciando carregamento de tarefas para o evento:', eventId);
      
      // Carregar todas as tarefas base com relacionamentos
      const allTasks = await Task.list({
        populate: [
          { path: 'category_id', select: 'name department_id' },
          { path: 'department_id', select: 'name' }
        ]
      });
      console.log('EventTasksTab - Todas as tarefas base com relacionamentos:', allTasks);
      setAvailableTasks(allTasks);
      
      // Carregar todas as tarefas de eventos com relacionamentos
      const eventTasks = await EventTask.list({
        populate: [
          { 
            path: 'task_id', 
            select: 'name description category_id department_id days_before_event',
            populate: [
              { path: 'category_id', select: 'name department_id' },
              { path: 'department_id', select: 'name' }
            ]
          },
          { 
            path: 'category_id', 
            select: 'name department_id color',
            populate: { 
              path: 'department_id', 
              select: 'name' 
            }
          },
          { 
            path: 'team_member_id', 
            select: 'name role department_id',
            populate: { 
              path: 'department_id', 
              select: 'name' 
            }
          }
        ]
      });
      
      // Filtrar e enriquecer tarefas do evento atual
      const tasksForEvent = eventTasks
        .filter(et => et.event_id === eventId)
        .map(et => {
          // Buscar detalhes da tarefa base
          const baseTask = allTasks.find(t => t.id === et.task_id?._id);
          
          // Determinar o departamento (prioridade: categoria atual > tarefa base categoria > tarefa base department)
          let departmentId = null;
          let departmentName = null;
          
          if (et.category_id?.department_id) {
            // Opção 1: Usar o departamento da categoria atual
            departmentId = et.category_id.department_id._id || et.category_id.department_id;
            departmentName = et.category_id.department_id.name;
          } else if (et.task_id?.category_id?.department_id) {
            // Opção 2: Usar o departamento da categoria da tarefa base
            departmentId = et.task_id.category_id.department_id._id || et.task_id.category_id.department_id;
            departmentName = et.task_id.category_id.department_id.name;
          } else if (et.task_id?.department_id) {
            // Opção 3: Usar o departamento da tarefa base diretamente
            departmentId = et.task_id.department_id._id || et.task_id.department_id;
            departmentName = et.task_id.department_id.name;
          } else if (baseTask?.department_id) {
            // Opção 4: Último recurso - usar o departamento do baseTask (normalmente não deveria chegar aqui)
            departmentId = baseTask.department_id._id || baseTask.department_id;
            departmentName = baseTask.department_id.name;
          }
          
          // Determinar a categoria (prioridade: categoria atual > tarefa base categoria)
          let categoryId = null;
          let categoryName = null;
          
          if (et.category_id) {
            categoryId = et.category_id._id || et.category_id;
            categoryName = et.category_id.name;
          } else if (et.task_id?.category_id) {
            categoryId = et.task_id.category_id._id || et.task_id.category_id;
            categoryName = et.task_id.category_id.name;
          } else if (baseTask?.category_id) {
            categoryId = baseTask.category_id._id || baseTask.category_id;
            categoryName = baseTask.category_id.name;
          }
          
          // Verificar se a data limite está próxima ou passou
          let isUrgent = false;
          let isLate = false;
          
          if (et.due_date && eventData?.start_date) {
            const dueDate = new Date(et.due_date);
            const today = new Date();
            const eventDate = new Date(eventData.start_date);
            
            if (dueDate < today) {
              isLate = true;
              isUrgent = true;
            } else if (dueDate > eventDate) {
              isUrgent = true;
            } else {
              // 2 dias de antecedência é considerado urgente
              const urgentLimit = new Date(eventDate);
              urgentLimit.setDate(urgentLimit.getDate() - 2);
              if (dueDate > urgentLimit) {
                isUrgent = true;
              }
            }
          }
          
          console.log('Processando tarefa:', {
            name: et.name || et.task_id?.name || "Tarefa não encontrada",
            originalDepartment: et.task_id?.department_id?.name,
            originalCategory: et.task_id?.category_id?.name,
            resolvedDepartment: departmentName,
            resolvedCategory: categoryName
          });
          
          // Combinar dados da tarefa do evento com a tarefa base
          return {
            ...et,
            name: et.name || et.task_id?.name || baseTask?.name || "Tarefa não encontrada",
            description: et.description || et.task_id?.description || baseTask?.description || "",
            category_id: et.category_id || et.task_id?.category_id || baseTask?.category_id,
            category_name: categoryName,
            team_member_id: et.team_member_id,
            department_id: departmentId,
            department_name: departmentName,
            days_before_event: et.task_id?.days_before_event || baseTask?.days_before_event || 0,
            estimated_hours: baseTask?.estimated_hours || 0,
            isUrgent: isUrgent,
            isLate: isLate
          };
        });
      
      console.log('EventTasksTab - Tarefas enriquecidas:', tasksForEvent);
      setTasks(tasksForEvent);

      // Se tiver tipo de evento, carregar tarefas padrão
      if (eventTypeId) {
        const defaultTasks = await DefaultTask.list();
        const filteredDefaultTasks = defaultTasks.filter(dt => dt.event_type_id === eventTypeId);
        setTypeTasks(filteredDefaultTasks);
      }
    } catch (error) {
      console.error('EventTasksTab - Erro ao carregar tarefas:', error);
      setTasks([]);
      setAvailableTasks([]);
      setTypeTasks([]);
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

  const handleCreateTask = async (taskData) => {
    try {
      console.log('EventTasksTab - Criando nova tarefa, dados recebidos:', taskData);
      
      // Dados básicos da tarefa - formato MongoDB
      const newTaskData = {
        event_id: eventId,
        task_id: taskData.task_id || null,
        name: taskData.name || "",
        description: taskData.description || "",
        category_id: taskData.category_id || null,
        team_member_id: taskData.team_member_id || null,
        due_date: taskData.due_date || null,
        notes: taskData.notes || "",
        status: "pending",
        priority: taskData.priority || "medium",
        estimated_hours: taskData.estimated_hours || 0,
        actual_hours: 0,
        is_active: true
      };
      
      console.log('EventTasksTab - Dados formatados para criar tarefa:', newTaskData);
      const newTask = await EventTask.create(newTaskData);
      console.log('EventTasksTab - Nova tarefa criada:', newTask);
      
      setShowForm(false);
      await loadTasks();
    } catch (error) {
      console.error('EventTasksTab - Erro ao criar tarefa:', error);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      console.log('EventTasksTab - Atualizando tarefa, dados recebidos:', { id, taskData });
      
      // Dados básicos da tarefa - formato MongoDB
      const updateData = {
        name: taskData.name || "",
        description: taskData.description || "",
        task_id: taskData.task_id || null,
        category_id: taskData.category_id || null,
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
    // Formatar dados para o formulário
    const formData = {
      ...task,
      task_id: task.task_id?._id || task.task_id || null,
      team_member_id: task.team_member_id?._id || task.team_member_id || null,
      category_id: task.category_id?._id || task.category_id || null
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
      const allTasks = await Task.list();
      console.log('EventTasksTab - Todas as tarefas:', allTasks);
      
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
          
          // Dados básicos da tarefa - formato MongoDB
          const taskData = {
            event_id: eventId,
            task_id: defaultTask.task_id,
            name: taskDetails.name || "Tarefa sem nome",
            description: taskDetails.description || "",
            category_id: taskDetails.category_id || null,
            team_member_id: null, // Campo atualizado de assigned_to para team_member_id
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
                  <TableCell>{task.department_name || 
                    (task.task_id?.department_id?.name ? task.task_id.department_id.name : "-")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {task.category_name || 
                       (task.category_id?.name ? task.category_id.name : 
                        (task.task_id?.category_id?.name ? task.task_id.category_id.name : "-"))}
                    </Badge>
                  </TableCell>
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