import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Link } from "@/components/ui/link";
import { TaskCategory } from "@/api/entities";
import { createPageUrl } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";

export default function EventTaskForm({ initialData, availableTasks, onSubmit, onCancel, eventId }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    task_id: "",
    description: "",
    responsible_role: "",
    due_date: "",
    category_id: "",
    is_active: true,
    is_required: false,
    days_before_event: 0,
    status: "not_started",
    notes: "",
    priority: "medium",
    estimated_hours: 0,
    actual_hours: 0,
    cost: 0
  });
  


  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
   }, []);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const taskCategories = await TaskCategory.list();
      console.log('EventTaskForm - Categorias carregadas:', taskCategories);
      // Filtra as categorias ativas no lado do cliente
      const activeCategories = taskCategories.filter(category => category.is_active);
      console.log('EventTaskForm - Categorias ativas:', activeCategories);
      setCategories(activeCategories);
    } catch (error) {
      console.error("Erro ao carregar categorias de tarefas:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter valores numéricos
    const submittedData = {
      ...formData,
      estimated_hours: parseFloat(formData.estimated_hours) || 0,
      actual_hours: parseFloat(formData.actual_hours) || 0,
      cost: parseFloat(formData.cost) || 0,
      days_before_event: parseInt(formData.days_before_event) || 0,
      is_required: Boolean(formData.is_required),
      is_active: true
    };

    if (initialData) {
      onSubmit(initialData.id, submittedData);
    } else {
      onSubmit({
        ...submittedData,
        event_id: eventId
      });
    }
  };

  const handleTaskSelect = (taskId) => {
    const selectedTask = availableTasks.find(task => task.id === taskId);
    if (selectedTask) {
      setFormData({
        ...formData,
        task_id: taskId,
        name: selectedTask.name,
        description: selectedTask.description || "",
        responsible_role: selectedTask.responsible_role || "",
        category_id: selectedTask.category_id || "",
        priority: selectedTask.priority || "medium",
        estimated_hours: selectedTask.estimated_hours || 0,
        notes: selectedTask.notes || ""
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!initialData && availableTasks && availableTasks.length > 0 && (
              <div>
                <Label htmlFor="task_template">Tarefa Base (Opcional)</Label>
                <Select
                  value={formData.task_id}
                  onValueChange={handleTaskSelect}
                >
                  <SelectTrigger id="task_template">
                    <SelectValue placeholder="Selecione uma tarefa base" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Selecione uma tarefa base para preencher os campos automaticamente
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="name">Nome da Tarefa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da tarefa"
                required
                disabled={initialData}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a tarefa..."
              className="h-24"
              disabled={initialData}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsible_role">Responsável</Label>
              <Input
                id="responsible_role"
                value={formData.responsible_role}
                onChange={e => setFormData(prev => ({ ...prev, responsible_role: e.target.value }))}
                placeholder="Quem é responsável por esta tarefa"
              />
            </div>
            
            <div>
              <Label htmlFor="due_date">Data Limite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="due_date"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(new Date(formData.due_date), "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={date => setFormData(prev => ({ ...prev, due_date: date ? date.toISOString().split('T')[0] : "" }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="category_id">Categoria</Label>
                <Link 
                  to={createPageUrl("TaskCategories")} 
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Gerenciar categorias
                </Link>
              </div>
              <Select
                value={formData.category_id}
                onValueChange={value => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#e5e7eb' }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                  {categories.length === 0 && !isLoadingCategories && (
                    <SelectItem value={null} disabled>
                      Cadastre categorias primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {categories.length === 0 && !isLoadingCategories && (
                <p className="text-amber-600 text-xs mt-1">
                  Cadastre categorias na seção Categorias de Tarefas
                </p>
              )}
            </div>

            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Não Iniciada</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              className="h-24"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Atualizar" : "Criar"} Tarefa
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}