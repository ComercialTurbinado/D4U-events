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
    setIsLoading(true);
    try {
      console.log('EventTasksTab - Carregando tarefas do evento:', eventId);
      const eventTasks = await EventTask.list({
        populate: [
          { path: 'task_id', select: 'name description category_id department_id' },
          { path: 'category_id', select: 'name color department_id' },
          { path: 'department_id', select: 'name' },
          { path: 'team_member_id', select: 'name role' }
        ]
      });
      
      const filteredTasks = eventTasks.filter(task => task.event_id === eventId);
      console.log('EventTasksTab - Tarefas filtradas:', filteredTasks);
      
      // Carregar tarefas base disponíveis
      await loadAvailableTasks();
      
      // Enriquecer dados das tarefas
      const enrichedTasks = await Promise.all(filteredTasks.map(async task => {
        // Logging das propriedades da tarefa para debug
        console.log(`Tarefa ${task.name} - Dados originais:`, {
          id: task.id || task._id,
          task_id: typeof task.task_id === 'object' ? task.task_id._id : task.task_id,
          department_id: typeof task.department_id === 'object' ? task.department_id._id : task.department_id,
          category_id: typeof task.category_id === 'object' ? task.category_id._id : task.category_id
        });
        
        let departmentName = null;
        let categoryName = null;
        let taskDept = null;
        
        // VERIFICAÇÃO DIRETA: departamento existe e está definido na tarefa?
        if (task.department_id) {
          taskDept = task.department_id;
          if (typeof task.department_id === 'object') {
            departmentName = task.department_id.name;
          }
          console.log(`Tarefa ${task.name}: Departamento direto encontrado:`, departmentName || taskDept);
        }
        
        // VERIFICAÇÃO CATEGORIA: categoria existe e tem departamento?
        if ((!taskDept || !departmentName) && task.category_id) {
          if (typeof task.category_id === 'object') {
            categoryName = task.category_id.name;
            
            if (task.category_id.department_id) {
              taskDept = task.category_id.department_id;
              if (typeof task.category_id.department_id === 'object') {
                departmentName = task.category_id.department_id.name;
              }
              console.log(`Tarefa ${task.name}: Departamento via categoria encontrado:`, departmentName || taskDept);
            }
          }
        }
        
        // Se ainda não tem departamento definido, verificar na tarefa original
        if ((!taskDept || !departmentName) && task.task_id) {
          if (typeof task.task_id === 'object') {
            // Verificar departamento direto na tarefa original
            if (task.task_id.department_id) {
              taskDept = task.task_id.department_id;
              if (typeof task.task_id.department_id === 'object') {
                departmentName = task.task_id.department_id.name;
              }
              console.log(`Tarefa ${task.name}: Departamento via tarefa original encontrado:`, departmentName || taskDept);
            }
            
            // Verificar departamento via categoria na tarefa original
            if ((!taskDept || !departmentName) && task.task_id.category_id) {
              if (typeof task.task_id.category_id === 'object' && task.task_id.category_id.department_id) {
                taskDept = task.task_id.category_id.department_id;
                if (typeof task.task_id.category_id.department_id === 'object') {
                  departmentName = task.task_id.category_id.department_id.name;
                }
                console.log(`Tarefa ${task.name}: Departamento via categoria da tarefa original:`, departmentName || taskDept);
              }
            }
          }
        }
        
        // Aviso se realmente não encontrou departamento
        if (!taskDept) {
          console.warn(`Tarefa ${task.name}: ALERTA - Não foi possível encontrar um departamento!`);
        } else if (!departmentName) {
          console.log(`Tarefa ${task.name}: Departamento encontrado (ID sem nome): ${taskDept}`);
        }
        
        // VERIFICAÇÃO DE CATEGORIA
        // Verificar categoria diretamente
        if (task.category_id) {
          if (typeof task.category_id === 'object') {
            categoryName = task.category_id.name;
          }
          console.log(`Tarefa ${task.name}: Usando categoria atual:`, categoryName || task.category_id);
        }
        
        // Se não encontrou categoria, verificar na tarefa original
        if (!categoryName && task.task_id) {
          if (typeof task.task_id === 'object' && task.task_id.category_id) {
            if (typeof task.task_id.category_id === 'object') {
              categoryName = task.task_id.category_id.name;
            }
            console.log(`Tarefa ${task.name}: Usando categoria da tarefa original:`, categoryName || task.task_id.category_id);
          }
        }
        
        console.log(`Processando tarefa final:`, {
          name: task.name,
          originalDepartment: departmentName,
          originalCategory: categoryName,
          resolvedDepartment: taskDept,
          resolvedCategory: task.category_id
        });
        
        const enriched = {
          ...task,
          department_name: departmentName,
          category_name: categoryName,
          department_id: taskDept || task.department_id,
          isUrgent: false,
          isLate: false
        };
        
        // Verificar status de data limite
        if (task.due_date) {
          const now = new Date();
          const dueDate = new Date(task.due_date);
          
          // Verificar se a data já passou
          if (dueDate < now) {
            enriched.isLate = true;
            enriched.isUrgent = true;
          } else {
            // Verificar se está próximo do prazo (menos de 3 dias)
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(now.getDate() + 3);
            if (dueDate <= threeDaysFromNow) {
              enriched.isUrgent = true;
            }
          }
        }
        
        return enriched;
      }));
      
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

  const loadAvailableTasks = async () => {
    try {
      const allTasks = await Task.list({
        populate: [
          { path: 'category_id', select: 'name department_id' },
          { path: 'department_id', select: 'name' }
        ]
      });
      console.log('EventTasksTab - Tarefas base carregadas:', allTasks);
      setAvailableTasks(allTasks);
    } catch (error) {
      console.error('EventTasksTab - Erro ao carregar tarefas base:', error);
      setAvailableTasks([]);
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