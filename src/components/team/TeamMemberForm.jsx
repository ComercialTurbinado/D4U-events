import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DepartmentOps } from "@/api/entities";
import PermissionAlert from "@/components/PermissionAlert";

export default function TeamMemberForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department_id: "",
    email: "",
    whatsapp: "",
    position: [],
    ...initialData
  });
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionAlert, setPermissionAlert] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await DepartmentOps.list();
      setDepartments(data);
    } catch (error) {
      if (error.type === 'permission') {
        setPermissionAlert(error);
      } else {
        setError("Erro ao carregar departamentos");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.type === 'permission') {
        setPermissionAlert(error);
      } else {
        setError("Erro ao salvar membro da equipe");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {permissionAlert && (
        <PermissionAlert
          open={true}
          onClose={() => setPermissionAlert(null)}
          title={permissionAlert.title}
          description={permissionAlert.description}
        />
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Cargo</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="department_id">Departamento</Label>
            <select
              id="department_id"
              value={formData.department_id}
              onChange={e => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              <option value="">Selecione um departamento</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label>Permissões</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit"
                  checked={formData.position.includes('edit')}
                  onCheckedChange={checked => {
                    setFormData(prev => ({
                      ...prev,
                      position: checked
                        ? [...prev.position, 'edit']
                        : prev.position.filter(p => p !== 'edit')
                    }));
                  }}
                />
                <Label htmlFor="edit">Editar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin"
                  checked={formData.position.includes('admin')}
                  onCheckedChange={checked => {
                    setFormData(prev => ({
                      ...prev,
                      position: checked
                        ? [...prev.position, 'admin']
                        : prev.position.filter(p => p !== 'admin')
                    }));
                  }}
                />
                <Label htmlFor="admin">Administrador</Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </Card>
    </form>
  );
} 