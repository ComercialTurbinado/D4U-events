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
      // Carregar tarefas do evento
      const eventTasks = await EventTask.list();
      const tasksForEvent = eventTasks.filter(et => et.event_id === eventId);
      setTasks(tasksForEvent);

      // Carregar todas as tarefas disponíveis
      const allTasks = await Task.list();
      setAvailableTasks(allTasks);

      // Carregar tarefas padrão do tipo de evento
      const defaultTasks = await DefaultTask.list();
      const enrichedTypeTasks = defaultTasks
        .filter(dt => dt.event_type_id === eventTypeId)
        .map(dt => ({
          ...dt,
          task: allTasks.find(t => t.id === dt.task_id)
        }));

      setTypeTasks(enrichedTypeTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
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
    await EventTask.create({
      ...taskData,
      event_id: eventId
    });
    setShowForm(false);
    loadTasks();
  };

  const handleUpdateTask = async (id, taskData) => {
    await EventTask.update(id, taskData);
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
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
    if (!eventTypeId) return;
    
    setIsLoading(true);
    try {
      const defaultTasks = await DefaultTask.list();
      const tasksToImport = defaultTasks.filter(dt => dt.event_type_id === eventTypeId);
      const existingTaskIds = tasks
        .filter(t => t.task_id)
        .map(t => t.task_id);
      
      for (const defaultTask of tasksToImport) {
        if (existingTaskIds.includes(defaultTask.task_id)) continue;
        
        const taskDetails = await Task.get(defaultTask.task_id);
        
        if (!taskDetails) continue;
        
        await EventTask.create({
          event_id: eventId,
          task_id: defaultTask.task_id,
          name: taskDetails.name,
          description: taskDetails.description,
          responsible_role: taskDetails.responsible_role,
          category: taskDetails.category,
          status: "not_started",
          due_date: null
        });
      }
      
      loadTasks();
    } catch (error) {
      console.error("Error importing default tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await EventTask.update(taskId, {
        ...task,
        status: newStatus
      });
      
      loadTasks();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
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
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  
  const getCategoryLabel = (category) => {
    const categories = {
      design: "Design",
      logistics: "Logística",
      suppliers: "Fornecedores",
      media: "Mídia",
      other: "Outros"
    };
    return categories[category] || category;
  };

  return (
    <div className="space-y-4">
      {showForm ? (
        <EventTaskForm
          initialData={editingTask}
          availableTasks={availableTasks}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tarefas do Evento</h2>
            <div className="flex gap-2">
              {eventTypeId && (
                <Button 
                  variant="outline" 
                  onClick={handleImportFromEventType}
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
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Data Limite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Carregando tarefas...
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhuma tarefa cadastrada para este evento
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        {task.category && (
                          <Badge variant="outline">
                            {getCategoryLabel(task.category)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{task.responsible_role || "-"}</TableCell>
                      <TableCell>
                        {task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value)}
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Não Iniciada</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(task)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}