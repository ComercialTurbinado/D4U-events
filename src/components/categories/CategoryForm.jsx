import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function CategoryForm({ initialData, onSubmit, onCancel, entityType }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6", // Default blue color
    is_active: true,
    ...initialData // Isso vai incluir o id se estiver editando
  });
  
  const [formError, setFormError] = useState(null);

  const getEntityTypeLabel = () => {
    switch(entityType) {
      case 'task': return 'Tarefa';
      case 'material': return 'Material';
      case 'supplier': return 'Fornecedor';
      default: return 'Item';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormError("O nome da categoria é obrigatório");
      return;
    }
    
    if (initialData) {
      onSubmit(formData.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (formError) setFormError(null);
              }}
              placeholder={`Ex: ${entityType === 'supplier' ? 'Gráfica' : 'Design'}`}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Descreva esta categoria de ${getEntityTypeLabel().toLowerCase()}...`}
              className="h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="color">Cor</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-20 h-10 p-1"
              />
              <div 
                className="w-10 h-10 rounded-md border"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-sm font-mono">{formData.color}</span>
            </div>
          </div>
          
          {initialData && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Categoria Ativa</Label>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Atualizar" : "Criar"} Categoria
        </Button>
      </div>
    </form>
  );
}