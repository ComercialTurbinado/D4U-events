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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { TeamMemberOps } from "@/api/team-member";
import PermissionAlert from "@/components/PermissionAlert";

export default function TeamMemberForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    role: initialData?.role || "",
    department_id: initialData?.department_id || "",
    email: initialData?.email || "",
    whatsapp: initialData?.whatsapp || "",
    is_active: initialData?.is_active ?? true,
    password: initialData?.password || "",
    position: initialData?.position || [],
    can_edit: false
  });

  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [shouldUpdatePassword, setShouldUpdatePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionAlert, setPermissionAlert] = useState(null);

  // Verifica se o usuário atual é admin ou o dono do perfil
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.position?.includes('admin');
  const isOwner = currentUser?.id === initialData?.id;

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
    setFormData(prev => ({
      ...prev,
      position: [permission] // Agora position é um array com apenas uma permissão
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPermissionAlert(null);

    try {
      const dataToSend = { ...formData };
      
      // Se não deve atualizar a senha, remove ela do objeto
      if (!shouldUpdatePassword) {
        delete dataToSend.password;
      }

      if (initialData) {
        await onSubmit(initialData.id, dataToSend);
        toast.success('Membro da equipe atualizado com sucesso!');
      } else {
        await onSubmit(dataToSend);
        toast.success('Membro da equipe criado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar membro da equipe:', error);
      if (error.type === 'permission') {
        setPermissionAlert(error);
      } else {
        setError(error.message || 'Erro ao salvar membro da equipe');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {permissionAlert && (
        <PermissionAlert
          title={permissionAlert.title}
          description={permissionAlert.description}
        />
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
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
          <div className="space-y-4">
            {(isAdmin || isOwner) && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {initialData && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShouldUpdatePassword(!shouldUpdatePassword)}
                    >
                      {shouldUpdatePassword ? 'Cancelar alteração' : 'Alterar senha'}
                    </Button>
                  )}
                </div>
                {shouldUpdatePassword && (
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite a nova senha"
                    required={!initialData}
                  />
                )}
                {initialData && !shouldUpdatePassword && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique em "Alterar senha" para modificar a senha atual
                  </p>
                )}
              </div>
            )}
             {(isAdmin) && (
              <div className="space-y-2">
                <Label>Permissões</Label>
                <RadioGroup
                  value={formData.position[0] || ''}
                  onValueChange={handlePermissionChange}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="view" id="view" />
                    <Label htmlFor="view">Visualizar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="edit" id="edit" />
                    <Label htmlFor="edit">Editar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Administrar</Label>
                  </div>
                </RadioGroup>
              </div>
             )}
              </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={departments.length === 0 || loading}
        >
          {loading ? "Salvando..." : initialData ? "Atualizar" : "Criar"} Membro
        </Button>
      </div>
    </form>
  );
} 