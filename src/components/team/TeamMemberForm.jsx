import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Department } from "@/api/entities";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function TeamMemberForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    role: "",
    department_id: "",
    email: "",
    whatsapp: "",
    is_active: true,
    position: [] // Array para armazenar as permissões selecionadas
  });

  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);

  // Verifica se o usuário atual é admin verificando o array position
  const isAdmin = JSON.parse(localStorage.getItem('user'))?.position?.includes('admin');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const departmentList = await Department.list();
      console.log('TeamMemberForm - Departamentos carregados:', departmentList);
      setDepartments(departmentList);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      setDepartments([]);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const newPosition = prev.position.includes(permission)
        ? prev.position.filter(p => p !== permission)
        : [...prev.position, permission];
      return { ...prev, position: newPosition };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submittedData = {
      ...formData,
      is_active: true
    };
    
    if (initialData) {
      onSubmit(initialData.id, submittedData);
    } else {
      onSubmit(submittedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Ex: Coordenador, Produtor, etc."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department_id">Setor</Label>
              <Select
                value={formData.department_id}
                onValueChange={value => setFormData(prev => ({ ...prev, department_id: value }))}
                required
                disabled={isLoadingDepartments}
              >
                <SelectTrigger id="department_id">
                  <SelectValue placeholder={isLoadingDepartments ? "Carregando..." : "Selecione um setor"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                  {departments.length === 0 && !isLoadingDepartments && (
                    <SelectItem value="" disabled>
                      Nenhum Setor cadastrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {departments.length === 0 && !isLoadingDepartments && (
                <p className="text-amber-600 text-xs mt-1">
                  Cadastre Setores primeiro
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          {isAdmin && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData?.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite a senha"
                  required={!initialData}
                />
                {initialData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe em branco para manter a senha atual
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Permissões</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="view"
                      checked={formData?.position?.includes('view')}
                      onCheckedChange={() => handlePermissionChange('view')}
                    />
                    <Label htmlFor="view">Visualizar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit"
                      checked={formData?.position?.includes('edit')}
                      onCheckedChange={() => handlePermissionChange('edit')}
                    />
                    <Label htmlFor="edit">Editar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin"
                      checked={formData?.position?.includes('admin')}
                      onCheckedChange={() => handlePermissionChange('admin')}
                    />
                    <Label htmlFor="admin">Administrar</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
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
        <Button 
          type="submit"
          disabled={departments.length === 0}
        >
          {initialData ? "Atualizar" : "Criar"} Membro
        </Button>
      </div>
    </form>
  );
} 