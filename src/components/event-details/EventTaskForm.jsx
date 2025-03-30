import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Link } from "@/components/ui/link";
import { TaskCategory, TeamMember } from "@/api/entities";
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
    team_member_id: "",
    due_date: "",
    category_id: "",
    is_active: true,
    is_required: false,
    days_before_event: 0,
    status: "pending",
    notes: "",
    priority: "medium",
    estimated_hours: 0,
    actual_hours: 0,
    cost: 0
  });

  const [categories, setCategories] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  useEffect(() => {
    loadCategories();
    loadTeamMembers();
  }, []);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const taskCategories = await TaskCategory.list({
        populate: [
          { path: 'department_id', select: 'name' }
        ]
      });
      
      console.log('Categorias carregadas:', taskCategories);
      
      const activeCategories = taskCategories.filter(category => category.is_active);
      setCategories(activeCategories);
    } catch (error) {
      console.error("Erro ao carregar categorias de tarefas:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadTeamMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const members = await TeamMember.list({
        populate: [
          { path: 'department_id', select: 'name' }
        ]
      });
      
      console.log('Membros carregados:', members);
      
      // Filtra apenas membros ativos
      const activeMembers = members.filter(member => member.is_active);
      setTeamMembers(activeMembers);
    } catch (error) {
      console.error("Erro ao carregar membros da equipe:", error);
      setTeamMembers([]);
    } finally {
      setIsLoadingMembers(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

  // Filtra membros pelo departamento da tarefa
  const getFilteredMembers = () => {
    if (!formData.category_id) return [];
    
    const selectedCategory = categories.find(cat => cat.id === formData.category_id);
    console.log('Categoria selecionada:', selectedCategory);
    
    if (!selectedCategory?.department_id) return [];
    
    const departmentId = selectedCategory.department_id._id || selectedCategory.department_id;
    console.log('ID do departamento:', departmentId);
    console.log('Todos os membros:', teamMembers);
    
    const filteredMembers = teamMembers.filter(member => {
      const memberDeptId = member.department_id?._id || member.department_id;
      const matches = memberDeptId === departmentId;
      console.log(`Membro ${member.name}, dept ${memberDeptId} === ${departmentId}? ${matches}`);
      return matches;
    });
    
    console.log('Membros filtrados:', filteredMembers);
    return filteredMembers;
  };

  const filteredMembers = getFilteredMembers();

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
              <div className="flex items-center justify-between">
                <Label htmlFor="category_id">Categoria/Departamento</Label>
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
                disabled={initialData}
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
                    <SelectItem value="none" disabled>
                      Cadastre categorias primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team_member_id">Responsável</Label>
              <Select
                value={formData.team_member_id}
                onValueChange={value => setFormData(prev => ({ ...prev, team_member_id: value }))}
              >
                <SelectTrigger id="team_member_id">
                  <SelectValue placeholder={
                    !formData.category_id 
                      ? "Selecione uma categoria primeiro" 
                      : filteredMembers.length === 0 
                        ? "Nenhum membro disponível" 
                        : "Selecione um responsável"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                  {formData.category_id && filteredMembers.length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhum membro neste departamento
                    </SelectItem>
                  )}
                  {!formData.category_id && (
                    <SelectItem value="none" disabled>
                      Selecione uma categoria primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formData.category_id && filteredMembers.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">
                  Cadastre membros para este departamento primeiro
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
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
        </div>
      </Card>

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
    </form>
  );
}