import React, { useState, useEffect } from "react";
import { TaskCategory, Department } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus } from "lucide-react";

export default function TaskForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    description: "",
    department_id: "",
    days_before_event: 7,
    category_id: "",
    is_required: true
  });

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);

  useEffect(() => {
    loadCategories();
    loadDepartments();
  }, []);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const taskCategories = await TaskCategory.list();
      // Filtra as categorias ativas no lado do cliente
      const activeCategories = taskCategories.filter(category => category.is_active);
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error loading task categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const depts = await Department.list();
      // Filtra os Setores ativos no lado do cliente
      const activeDepts = depts.filter(dept => dept.is_active);
      setDepartments(activeDepts);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      onSubmit(initialData.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Tarefa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Enviar briefing para designer"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os detalhes desta tarefa..."
              className="h-24"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="department_id">Setor Responsável</Label>
                <Link 
                  to={createPageUrl("Departments")} 
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Gerenciar setores
                </Link>
              </div>
              <Select
                value={formData.department_id}
                onValueChange={value => setFormData(prev => ({ ...prev, department_id: value }))}
              >
                <SelectTrigger id="department_id">
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                  {departments.length === 0 && !isLoadingDepartments && (
                    <SelectItem value={null} disabled>
                      Cadastre setores primeiro
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {departments.length === 0 && !isLoadingDepartments && (
                <p className="text-amber-600 text-xs mt-1">
                  Cadastre setores na seção de Setores Responsáveis
                </p>
              )}
            </div>
            
            
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
              <Label htmlFor="days_before_event">Dias Antes do Evento</Label>
              <Input
                id="days_before_event"
                type="number"
                value={formData.days_before_event}
                onChange={e => setFormData(prev => ({ ...prev, days_before_event: parseInt(e.target.value) }))}
              />
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, is_required: checked }))}
                />
                <Label htmlFor="is_required">Tarefa Obrigatória</Label>
              </div>
            </div>
          </div>
          
          
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Atualizar" : "Criar"} Tarefa
        </Button>
      </div>
    </form>
  );
}