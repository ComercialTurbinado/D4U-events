import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, addDays, isAfter, subDays } from "date-fns";
import { Link } from "@/components/ui/link";
import { TaskCategory, TeamMember, Department, Task } from "@/api/entities";
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
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, AlertTriangle, Info, Lock } from "lucide-react";

export default function EventTaskForm({ initialData, availableTasks, onSubmit, onCancel, eventId, eventDate }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    task_id: "",
    description: "",
    responsible_role: "",
    team_member_id: "",
    due_date: "",
    department_id: "",
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
  const [departments, setDepartments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isDateUrgent, setIsDateUrgent] = useState(false);
  const [isDatePast, setIsDatePast] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoadingOriginalTask, setIsLoadingOriginalTask] = useState(false);
  const [originalTask, setOriginalTask] = useState(null);
  const [hasOriginalTask, setHasOriginalTask] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadCategories();
    loadTeamMembers();
    
    // Log de dados iniciais ao montar componente
    if (initialData) {
      console.log('EventTaskForm - Dados iniciais recebidos:', initialData);
      
      // Se tiver task_id, carregar dados da tarefa original
      if (initialData.task_id) {
        loadOriginalTask(initialData.task_id);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      filterCategoriesByDepartment(formData.department_id);
    } else {
      setFilteredCategories([]);
    }
  }, [formData.department_id, categories]);

  useEffect(() => {
    checkDateStatus();
  }, [formData.due_date, eventDate]);

  const loadOriginalTask = async (taskId) => {
    setIsLoadingOriginalTask(true);
    try {
      console.log('Carregando detalhes da tarefa original:', taskId);
      const task = await Task.get(taskId, {
        populate: [
          { path: 'category_id', select: 'name department_id' },
          { path: 'department_id', select: 'name' }
        ]
      });
      
      if (task) {
        console.log('Tarefa original encontrada:', task);
        setOriginalTask(task);
        setHasOriginalTask(true);
        
        // Determinar o departamento da tarefa original
        let departmentId = null;
        
        if (task.category_id?.department_id) {
          departmentId = task.category_id.department_id._id || task.category_id.department_id;
        } else if (task.department_id) {
          departmentId = task.department_id._id || task.department_id;
        }
        
        // Atualizar os dados do formulário com base na tarefa original
        setFormData(prev => ({
          ...prev,
          name: task.name || prev.name,
          description: task.description || prev.description,
          department_id: departmentId || prev.department_id,
          category_id: task.category_id?._id || task.category_id || prev.category_id,
          days_before_event: task.days_before_event || prev.days_before_event,
          // Não sobrescreve campos editáveis
          team_member_id: prev.team_member_id,
          status: prev.status,
          priority: task.priority || prev.priority,
          estimated_hours: task.estimated_hours || prev.estimated_hours
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar tarefa original:", error);
    } finally {
      setIsLoadingOriginalTask(false);
    }
  };

  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const departmentList = await Department.list();
      const activeDepartments = departmentList.filter(dept => dept.is_active);
      console.log('Departamentos carregados:', activeDepartments);
      setDepartments(activeDepartments);
      
      // Se tivermos dados iniciais, detectar o departamento da categoria
      if (initialData?.category_id && categories.length > 0) {
        const category = categories.find(cat => cat.id === initialData.category_id);
        if (category?.department_id) {
          const deptId = category.department_id._id || category.department_id;
          setFormData(prev => ({ ...prev, department_id: deptId }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
      setDepartments([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

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
      
      // Se já temos departamento selecionado, filtrar categorias
      if (formData.department_id) {
        filterCategoriesByDepartment(formData.department_id);
      }
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

  const filterCategoriesByDepartment = (departmentId) => {
    if (!departmentId || categories.length === 0) {
      setFilteredCategories([]);
      return;
    }
    
    const filtered = categories.filter(category => {
      const catDeptId = category.department_id?._id || category.department_id;
      return catDeptId === departmentId;
    });
    
    console.log('Categorias filtradas por departamento:', filtered);
    setFilteredCategories(filtered);
  };

  const handleTaskSelect = (taskId) => {
    console.log('Selecionando tarefa base:', taskId);
    const selectedTask = availableTasks.find(task => task.id === taskId);
    
    if (selectedTask) {
      console.log('Tarefa base encontrada:', selectedTask);
      
      // Encontrar o departamento e categoria da tarefa selecionada
      let departmentId = null;
      let categoryId = null;
      
      // Verificar se a tarefa base tem categoria com departamento aninhado
      if (selectedTask.category_id) {
        console.log('Categoria da tarefa base:', selectedTask.category_id);
        categoryId = selectedTask.category_id._id || selectedTask.category_id;
        
        // Verificar se temos departamento na categoria
        if (selectedTask.category_id.department_id) {
          departmentId = selectedTask.category_id.department_id._id || selectedTask.category_id.department_id;
          console.log('Departamento encontrado via categoria:', departmentId);
        }
      }
      
      // Se não encontrou departamento via categoria, verificar departamento direto
      if (!departmentId && selectedTask.department_id) {
        departmentId = selectedTask.department_id._id || selectedTask.department_id;
        console.log('Departamento encontrado diretamente:', departmentId);
      }
      
      // Buscar a categoria completa se tivermos apenas o ID
      let categoryObj = null;
      if (categoryId && categories.length > 0) {
        categoryObj = categories.find(cat => cat.id === categoryId);
        console.log('Objeto da categoria encontrado:', categoryObj);
        
        // Se encontrou a categoria e ela tem departamento, atualize o departmentId
        if (categoryObj?.department_id && !departmentId) {
          departmentId = categoryObj.department_id._id || categoryObj.department_id;
          console.log('Departamento atualizado via objeto categoria:', departmentId);
        }
      }
      
      // Filtrar categorias para o departamento selecionado
      if (departmentId) {
        filterCategoriesByDepartment(departmentId);
      }
      
      // Calcular data limite com base nos dias antes do evento
      let dueDate = "";
      if (eventDate && selectedTask.days_before_event) {
        const eventDateObj = new Date(eventDate);
        const dueDateObj = addDays(eventDateObj, -selectedTask.days_before_event);
        
        // Garantir que a data não seja após o limite máximo (2 dias antes do evento)
        const maxAllowedDate = subDays(eventDateObj, 2);
        if (isAfter(dueDateObj, maxAllowedDate)) {
          dueDate = maxAllowedDate.toISOString().split('T')[0];
        } else {
          dueDate = dueDateObj.toISOString().split('T')[0];
        }
      }
      
      console.log('Atualizando formulário com dados da tarefa base:', {
        taskId,
        name: selectedTask.name,
        departmentId,
        categoryId,
        dueDate
      });
      
      setFormData({
        ...formData,
        task_id: taskId,
        name: selectedTask.name,
        description: selectedTask.description || "",
        responsible_role: selectedTask.responsible_role || "",
        department_id: departmentId,
        category_id: categoryId,
        days_before_event: selectedTask.days_before_event || 0,
        due_date: dueDate,
        priority: selectedTask.priority || "medium",
        estimated_hours: selectedTask.estimated_hours || 0,
        notes: selectedTask.notes || ""
      });
    }
  };

  const handleDepartmentChange = (departmentId) => {
    setFormData(prev => ({ 
      ...prev, 
      department_id: departmentId,
      category_id: "", // Limpar categoria quando departamento muda
      team_member_id: "" // Limpar membro quando departamento muda
    }));
    
    // Filtrar categorias pelo novo departamento
    filterCategoriesByDepartment(departmentId);
  };

  const checkDateStatus = () => {
    if (!formData.due_date || !eventDate) {
      setIsDateUrgent(false);
      setIsDatePast(false);
      return;
    }
    
    const today = new Date();
    const dueDate = new Date(formData.due_date);
    const eventDateObj = new Date(eventDate);
    
    // Data máxima permitida = 2 dias antes do evento
    const maxAllowedDate = subDays(eventDateObj, 2);
    
    console.log('Verificando status de data:', {
      dataLimite: dueDate,
      dataEvento: eventDateObj,
      dataMaximaPermitida: maxAllowedDate,
      hoje: today
    });
    
    // Verificar se a data está no passado
    if (isBefore(dueDate, today)) {
      setIsDatePast(true);
      setIsDateUrgent(true);
      return;
    }
    
    // Verificar se a data é depois da data máxima permitida (2 dias antes do evento)
    if (isAfter(dueDate, maxAllowedDate)) {
      setIsDateUrgent(true);
      setIsDatePast(false);
      return;
    }
    
    // Verificar se a data está próxima da data máxima (menos de 3 dias de folga)
    const safeLimit = subDays(maxAllowedDate, 3);
    if (isAfter(dueDate, safeLimit)) {
      setIsDateUrgent(true);
      setIsDatePast(false);
      return;
    }
    
    setIsDateUrgent(false);
    setIsDatePast(false);
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
    if (!formData.department_id) return [];
    
    console.log('Filtrando membros para o departamento:', formData.department_id);
    console.log('Todos os membros:', teamMembers);
    
    const filteredMembers = teamMembers.filter(member => {
      const memberDeptId = member.department_id?._id || member.department_id;
      const matches = memberDeptId === formData.department_id;
      console.log(`Membro ${member.name}, dept ${memberDeptId} === ${formData.department_id}? ${matches}`);
      return matches;
    });
    
    console.log('Membros filtrados:', filteredMembers);
    return filteredMembers;
  };

  const filteredMembers = getFilteredMembers();
  
  // Verifica se está editando uma tarefa com task_id
  const isEditingWithOriginalTask = initialData && (initialData.task_id || hasOriginalTask);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          {isEditingWithOriginalTask && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Info className="h-4 w-4" />
                <span className="font-medium">Tarefa vinculada a modelo</span>
              </div>
              <p className="text-sm text-blue-600">
                Esta tarefa está vinculada a um modelo pré-definido. Alguns campos não podem ser modificados.
              </p>
            </div>
          )}
        
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
              <Label htmlFor="name" className="flex items-center gap-1">
                Nome da Tarefa 
                {isEditingWithOriginalTask && <Lock className="h-3 w-3 text-gray-400" />}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da tarefa"
                required
                disabled={isEditingWithOriginalTask}
                className={isEditingWithOriginalTask ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="flex items-center gap-1">
              Descrição
              {isEditingWithOriginalTask && <Lock className="h-3 w-3 text-gray-400" />}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a tarefa..."
              className={`h-24 ${isEditingWithOriginalTask ? "bg-gray-50" : ""}`}
              disabled={isEditingWithOriginalTask}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleção de Departamento */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="department_id" className="flex items-center gap-1">
                  Setor
                  {isEditingWithOriginalTask && <Lock className="h-3 w-3 text-gray-400" />}
                </Label>
                {!isEditingWithOriginalTask && (
                  <Link 
                    to={createPageUrl("departments")} 
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Gerenciar setores
                  </Link>
                )}
              </div>
              <Select
                value={formData.department_id}
                onValueChange={handleDepartmentChange}
                disabled={isEditingWithOriginalTask}
              >
                <SelectTrigger id="department_id" className={isEditingWithOriginalTask ? "bg-gray-50" : ""}>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(department => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                  {departments.length === 0 && !isLoadingDepartments && (
                    <SelectItem value="none" disabled>
                      Cadastre departamentos primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Categoria */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="category_id" className="flex items-center gap-1">
                  Categoria
                  {isEditingWithOriginalTask && <Lock className="h-3 w-3 text-gray-400" />}
                </Label>
                {!isEditingWithOriginalTask && (
                  <Link 
                    to={createPageUrl("task-categories")} 
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Gerenciar categorias
                  </Link>
                )}
              </div>
              <Select
                value={formData.category_id}
                onValueChange={value => setFormData(prev => ({ ...prev, category_id: value }))}
                disabled={!formData.department_id || isEditingWithOriginalTask}
              >
                <SelectTrigger id="category_id" className={isEditingWithOriginalTask ? "bg-gray-50" : ""}>
                  <SelectValue placeholder={
                    !formData.department_id 
                      ? "Selecione um setor primeiro" 
                      : "Selecione uma categoria"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(category => (
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
                  {formData.department_id && filteredCategories.length === 0 && !isLoadingCategories && (
                    <SelectItem value="none" disabled>
                      Cadastre categorias para este setor primeiro
                    </SelectItem>
                  )}
                  {!formData.department_id && (
                    <SelectItem value="none" disabled>
                      Selecione um setor primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleção de Membro da Equipe */}
            <div>
              <Label htmlFor="team_member_id">Responsável</Label>
              <Select
                value={formData.team_member_id}
                onValueChange={value => setFormData(prev => ({ ...prev, team_member_id: value }))}
              >
                <SelectTrigger id="team_member_id">
                  <SelectValue placeholder={
                    !formData.department_id 
                      ? "Selecione um setor primeiro" 
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
                  {formData.department_id && filteredMembers.length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhum membro neste setor
                    </SelectItem>
                  )}
                  {!formData.department_id && (
                    <SelectItem value="none" disabled>
                      Selecione um setor primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formData.department_id && filteredMembers.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">
                  Cadastre membros para este setor primeiro
                </p>
              )}
            </div>

            {/* Seleção de Data Limite */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="due_date" className="flex items-center gap-1">
                  Data Limite
                  {isEditingWithOriginalTask && <Lock className="h-3 w-3 text-gray-400" />}
                </Label>
                {isDateUrgent && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {isDatePast ? "ATRASADO" : "URGENTE"}
                  </Badge>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="due_date"
                    className={`w-full justify-start text-left font-normal ${isDateUrgent ? 'border-red-500' : ''} ${isEditingWithOriginalTask ? 'bg-gray-50' : ''}`}
                    disabled={isEditingWithOriginalTask}
                  >
                    <CalendarIcon className={`mr-2 h-4 w-4 ${isDateUrgent ? 'text-red-500' : ''}`} />
                    {formData.due_date ? (
                      format(new Date(formData.due_date), "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-2 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    A data limite deve ser no máximo até 2 dias antes do evento.
                  </div>
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={date => {
                      // Verificar se a data selecionada é posterior a 2 dias antes do evento
                      if (date && eventDate) {
                        const eventDateObj = new Date(eventDate);
                        const maxAllowedDate = subDays(eventDateObj, 2);
                        
                        // Se a data selecionada for posterior à data máxima permitida, use a data máxima
                        if (isAfter(date, maxAllowedDate)) {
                          console.log('Data selecionada após limite máximo, ajustando para:', maxAllowedDate);
                          setFormData(prev => ({ 
                            ...prev, 
                            due_date: maxAllowedDate.toISOString().split('T')[0] 
                          }));
                          return;
                        }
                      }
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        due_date: date ? date.toISOString().split('T')[0] : "" 
                      }));
                    }}
                    disabled={(date) => {
                      // Desabilitar datas após 2 dias antes do evento
                      if (!eventDate) return false;
                      
                      const eventDateObj = new Date(eventDate);
                      const maxAllowedDate = subDays(eventDateObj, 2);
                      
                      return isAfter(date, maxAllowedDate);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.days_before_event > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Prazo recomendado: {formData.days_before_event} dias antes do evento
                </p>
              )}
              {eventDate && (
                <p className="text-xs text-amber-600 mt-1">
                  Data máxima permitida: {format(subDays(new Date(eventDate), 2), "dd/MM/yyyy")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                id="priority"
                value={formData.priority}
                onValueChange={value => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
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