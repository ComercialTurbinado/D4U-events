import React, { useState, useEffect } from "react";
import { EventTask, Task, DefaultTask } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle } from "lucide-react";
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

export default function EventTasksTab({ eventId, eventTypeId }) {
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
      
      // Carregar todas as tarefas de eventos
      const eventTasks = await EventTask.list();
      console.log('EventTasksTab - Todas as tarefas:', eventTasks);
      
      // Filtrar tarefas do evento atual
      const tasksForEvent = eventTasks.filter(et => {
        const eventIdMatches = et.event_id === eventId;
        console.log('EventTasksTab - Comparando:', {
          taskEventId: et.event_id,
          currentEventId: eventId,
          matches: eventIdMatches
        });
        return eventIdMatches;
      });
      console.log('EventTasksTab - Tarefas filtradas para o evento:', tasksForEvent);
      
      // Carregar todas as tarefas base disponíveis
      const allTasks = await Task.list();
      console.log('EventTasksTab - Todas as tarefas base:', allTasks);
      setAvailableTasks(allTasks);
      
      // Se tiver tipo de evento, carregar tarefas padrão
      if (eventTypeId) {
        console.log('EventTasksTab - Carregando tarefas padrão para o tipo:', eventTypeId);
        const defaultTasks = await DefaultTask.list();
        const filteredDefaultTasks = defaultTasks.filter(dt => {
          const typeIdMatches = dt.event_type_id === eventTypeId;
          console.log('EventTasksTab - Comparando tipo:', {
            taskTypeId: dt.event_type_id,
            currentTypeId: eventTypeId,
            matches: typeIdMatches
          });
          return typeIdMatches;
        });
        console.log('EventTasksTab - Tarefas padrão filtradas:', filteredDefaultTasks);
        setTypeTasks(filteredDefaultTasks);
      }
      
      // Atualizar estado com as tarefas do evento
      setTasks(tasksForEvent);
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
      
      // Remover campos que podem causar conflito
      const { _id, __v, createdAt, updatedAt, category_id, id, ...cleanData } = taskData;
      
      // Dados básicos da tarefa
      const newTaskData = {
        name: cleanData.name,
        description: cleanData.description || "",
        responsible_role: cleanData.responsible_role || "",
        category: "other", // Valor padrão
        priority: cleanData.priority || "medium",
        estimated_hours: cleanData.estimated_hours || 0,
        notes: cleanData.notes || "",
        event_id: eventId,
        task_id: cleanData.task_id,
        is_active: true,
        status: "not_started",
        due_date: cleanData.due_date || null,
        actual_hours: 0,
        cost: 0
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
      
      // Remover campos que podem causar conflito
      const { _id, __v, createdAt, updatedAt, category_id, id: taskId, ...cleanData } = taskData;
      
      // Dados básicos da tarefa
      const updateData = {
        name: cleanData.name,
        description: cleanData.description || "",
        responsible_role: cleanData.responsible_role || "",
        category: "other", // Valor padrão
        priority: cleanData.priority || "medium",
        estimated_hours: cleanData.estimated_hours || 0,
        notes: cleanData.notes || "",
        event_id: eventId,
        task_id: cleanData.task_id,
        is_active: true,
        status: cleanData.status || "not_started",
        due_date: cleanData.due_date || null,
        actual_hours: cleanData.actual_hours || 0,
        cost: cleanData.cost || 0
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
    setEditingTask(task);
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
          
          // Remover campos que podem causar conflito
          const { _id, __v, createdAt, updatedAt, category_id, ...cleanTaskDetails } = taskDetails;
          
          // Dados básicos da tarefa
          const taskData = {
            name: cleanTaskDetails.name,
            description: cleanTaskDetails.description || "",
            responsible_role: cleanTaskDetails.responsible_role || "",
            category: "other", // Valor padrão
            priority: cleanTaskDetails.priority || "medium",
            estimated_hours: cleanTaskDetails.estimated_hours || 0,
            notes: cleanTaskDetails.notes || "",
            event_id: eventId,
            task_id: defaultTask.task_id,
            is_active: true,
            is_required: defaultTask.is_required || false,
            days_before_event: defaultTask.days_before_event || 0,
            status: "not_started",
            due_date: null,
            actual_hours: 0,
            cost: 0
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
      await EventTask.update(taskId, { status: newStatus });
      console.log('EventTasksTab - Status atualizado com sucesso');
      await loadTasks();
    } catch (error) {
      console.error('EventTasksTab - Erro ao alterar status:', error);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      not_started: "Não Iniciada",
      in_progress: "Em Andamento",
      completed: "Concluída",
      cancelled: "Cancelada"
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status) => {
    const colors = {
      not_started: "bg-gray-100 text-gray-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
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
              <TableHead>Responsável</TableHead>
              <TableHead>Data Limite</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Nenhuma tarefa cadastrada
                </TableCell>
              </TableRow>
            ) : (
              tasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.responsible_role || "-"}</TableCell>
                  <TableCell>
                    {task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getCategoryLabel(task.category)}
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
                        onClick={() => handleStatusChange(task.id, task.status === "completed" ? "not_started" : "completed")}
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