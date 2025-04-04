import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, addDays, isAfter, subDays } from "date-fns";
import { Link } from "@/components/ui/link";
import { TaskCategory, TeamMember, Department, Task, Event } from "@/api/entities";
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
import { EventTask, DefaultTask } from "@/api/entities";

export default function EventTaskForm({ initialData, availableTasks, onSubmit, onCancel, eventId, eventDate }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    task_id: "",
    event_id: "",
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
   const [isLoadingOriginalTask, setIsLoadingOriginalTask] = useState(false);
  const [originalTask, setOriginalTask] = useState(null);
  const [hasOriginalTask, setHasOriginalTask] = useState(false);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    loadDepartments();
    loadCategories();
    loadTeamMembers();
    
    if (initialData) {
      console.log('EventTaskForm - Dados iniciais recebidos:', initialData);
      
      if (initialData.task_id) {
        loadOriginalTask(initialData.task_id);
      }
    }
  }, []);

  useEffect(() => {
    checkDateStatus();
  }, [formData.due_date, eventDate]);

  useEffect(() => {
    // Carregar dados do evento para obter a data de início
    const loadEventData = async () => {
      try {
        const event = await Event.get(eventId); // Supondo que exista uma função para obter o evento
        if (event) {
          setEventData(event);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do evento:', error);
      }
    };

    loadEventData();
  }, [eventId]);

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
        let categoryId = null;
        let foundDepartment = false;
        
        // Verificar se temos categoria com departamento
        if (task.category_id) {
          console.log('Tarefa original - verificando categoria:', task.category_id);
          
          if (typeof task.category_id === 'object') {
            categoryId = task.category_id._id;
            console.log('Tarefa original - categoria encontrada (objeto):', categoryId);
            
            // Verificar se a categoria tem departamento
            if (task.category_id.department_id) {
              departmentId = typeof task.category_id.department_id === 'object' 
                ? task.category_id.department_id._id 
                : task.category_id.department_id;
              console.log('Tarefa original - departamento via categoria:', departmentId);
              foundDepartment = true;
            }
          } else {
            // Se for apenas o ID da categoria
            categoryId = task.category_id;
            console.log('Tarefa original - categoria encontrada (id):', categoryId);
          }
        }
        
        // Se não encontrou departamento via categoria, verificar departamento direto
        if (!foundDepartment && task.department_id) {
          console.log('Tarefa original - verificando departamento direto:', task.department_id);
          
          departmentId = typeof task.department_id === 'object' 
            ? task.department_id._id 
            : task.department_id;
            
          console.log('Tarefa original - departamento direto:', departmentId);
          foundDepartment = true;
        }
        
        // Se ainda não encontrou, verificar se inicialmente já temos departamento/categoria
        if (!foundDepartment && initialData) {
          console.log('Verificando departamento nos dados iniciais:', initialData.department_id);
          
          if (initialData.department_id) {
            departmentId = initialData.department_id;
            foundDepartment = true;
            console.log('Usando departamento dos dados iniciais:', departmentId);
          }
        }
        
        if (!categoryId && initialData) {
          console.log('Verificando categoria nos dados iniciais:', initialData.category_id);
          
          if (initialData.category_id) {
            categoryId = initialData.category_id;
            console.log('Usando categoria dos dados iniciais:', categoryId);
          }
        }
        
        // Alerta se não encontrou departamento
        if (!foundDepartment) {
          console.warn(`Tarefa ${task.name}: ALERTA - Não foi possível encontrar um departamento!`);
          // Se já temos departamento no formulário, mantemos
          if (formData.department_id) {
            departmentId = formData.department_id;
            console.log('Usando departamento atual do formulário:', departmentId);
          }
        }
        
        // Alerta se não encontrou categoria
        if (!categoryId) {
          console.warn(`Tarefa ${task.name}: ALERTA - Não foi possível encontrar uma categoria!`);
          // Se já temos categoria no formulário, mantemos
          if (formData.category_id) {
            categoryId = formData.category_id;
            console.log('Usando categoria atual do formulário:', categoryId);
          }
        }
        
        console.log('Atualizando formulário com dados da tarefa original:', {
          name: task.name,
          departmentId: departmentId,
          categoryId: categoryId,
          foundDepartment: foundDepartment
        });
        
        
        // Atualizar os dados do formulário com base na tarefa original
        setFormData(prev => ({
          ...prev,
          name: task.name || prev.name,
          description: task.description || prev.description,
          department_id: departmentId || prev.department_id,
          category_id: categoryId || prev.category_id,
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
      const taskCategories = await TaskCategory.list();
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
      const allTeamMembers = await TeamMember.list();
      console.log('EventTasksTab - Membros da equipe carregados:', allTeamMembers);
      
      // Filtra apenas membros ativos
      const activeMembers = allTeamMembers.filter(member => member.is_active);
      setTeamMembers(activeMembers);
    } catch (error) {
      console.error("Erro ao carregar membros da equipe:", error);
      setTeamMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
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
        event_id: eventId,
        name: selectedTask.name,
        description: selectedTask.description || "",
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
      team_member_id: "" // Limpar membro quando departamento muda
    }));
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
    
    // Verificar se a data limite é após a data do evento
    if (dueDate > eventDateObj) {
      setFormData(prev => ({
        ...prev,
        due_date: eventDateObj.toISOString().split('T')[0]
      }));
      return;
    }
    
    // Verificar se a data está no passado
    if (isBefore(dueDate, today)) {
      setIsDatePast(true);
      setIsDateUrgent(true);
      return;
    }
    
    // Verificar se a data está próxima da data máxima (menos de 3 dias de folga)
    const safeLimit = subDays(eventDateObj, 3);
    if (isAfter(dueDate, safeLimit)) {
      setIsDateUrgent(true);
      setIsDatePast(false);
      return;
    }
    
    setIsDateUrgent(false);
    setIsDatePast(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Criar cópia dos dados para enviar
    const dataToSubmit = { ...formData };
    
    // Se não tiver departamento ou categoria, enviar null ou undefined
    if (!dataToSubmit.department_id) dataToSubmit.department_id = null;
    if (!dataToSubmit.category_id) dataToSubmit.category_id = null;
    
    // Verificar se o membro selecionado tem departamento associado
    if (dataToSubmit.team_member_id) {
      const selectedMember = teamMembers.find(m => m.id === dataToSubmit.team_member_id);
      if (!selectedMember?.department_id) {
        // Se o membro não tiver departamento, remover o team_member_id
        dataToSubmit.team_member_id = null;
        console.warn('Membro selecionado não possui departamento associado. Removendo associação.');
      }
    }

    // Garantir que o event_id está presente
    dataToSubmit.event_id = eventId;

    console.log('EventTaskForm - Enviando dados do formulário:', dataToSubmit);
    
    // Se estiver editando, passar o ID e os dados para a função onSubmit
    if (initialData && initialData.id) {
      console.log('EventTaskForm - Atualizando tarefa com ID:', initialData.id);
      onSubmit(initialData.id, dataToSubmit);
    } else {
      // Se estiver criando, passar apenas os dados
      onSubmit(dataToSubmit);
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

  const handleDateSelect = (date) => {
    if (date) {
      const today = new Date();
      const eventDateObj = new Date(eventDate);

      // Calcular o tempo de execução da tarefa
      const executionTime = addDays(today, formData.days_before_event);

      // Se o tempo de execução ultrapassar a data do evento, marque como urgente
      if (isAfter(executionTime, eventDateObj)) {
        console.log('Tempo de execução ultrapassa a data do evento, marcando como urgente.');
        setIsDateUrgent(true);
        setFormData(prev => ({
          ...prev,
          priority: 'high' // Marcar como alta prioridade
        }));
      } else {
        setIsDateUrgent(false);
      }

      // Impedir seleção de datas passadas
      if (isBefore(date, today)) {
        console.warn('Data selecionada já passou, ajustando para hoje.');
        date = today;
      }

      setFormData(prev => ({
        ...prev,
        due_date: date.toISOString().split('T')[0]
      }));
    }
  };

  const getTeamMemberName = (task) => {
    if (!task.team_member_id) return "-";
    
    // Se já temos o nome do responsável na tarefa enriquecida
    if (task.team_member_name) {
      return task.team_member_name;
    }
    
    // Se o team_member_id é um objeto com propriedade name
    if (typeof task.team_member_id === 'object' && task.team_member_id?.name) {
      return task.team_member_id.name;
    }
    
    return "-";
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleção de Departamento */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="department_id">Setor</Label>
                <Link 
                  to={createPageUrl("departments")} 
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Gerenciar setores
                </Link>
              </div>
              <Select
                value={formData.department_id}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger id="department_id">
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
                <Label htmlFor="category_id">Categoria</Label>
                <Link 
                  to={createPageUrl("task-categories")} 
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
                    <SelectItem value="none" disabled>
                      Cadastre categorias primeiro
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
                    className={`w-full justify-start text-left font-normal ${isDateUrgent ? 'border-red-500' : ''}`}
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
                  
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={handleDateSelect}
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