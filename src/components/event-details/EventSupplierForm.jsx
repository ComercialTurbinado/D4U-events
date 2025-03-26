import React, { useState } from "react";
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

export default function EventSupplierForm({ initialData, availableSuppliers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    supplier_id: "",
    name: "",
    supplier_type: "other",
    contact_person: "",
    phone: "",
    service_description: "",
    status: "requested",
    cost: "",
    notes: ""
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert cost to number if provided
    const submittedData = {
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : undefined
    };
    
    if (initialData) {
      onSubmit(initialData.id, submittedData);
    } else {
      onSubmit(submittedData);
    }
  };
  
  const handleTemplateSupplierChange = (supplierId) => {
    if (!supplierId) {
      setFormData(prev => ({
        ...prev,
        supplier_id: "",
        name: "",
        supplier_type: "other",
        contact_person: "",
        phone: "",
        service_description: ""
      }));
      return;
    }
    
    const selectedSupplier = availableSuppliers.find(s => s.id === supplierId);
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplier_id: selectedSupplier.id,
        name: selectedSupplier.name,
        supplier_type: selectedSupplier.supplier_type,
        contact_person: selectedSupplier.contact_person || "",
        phone: selectedSupplier.phone || "",
        service_description: selectedSupplier.service_description || ""
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          {availableSuppliers && availableSuppliers.length > 0 && !initialData && (
            <div>
              <Label htmlFor="template_supplier">Usar Fornecedor Cadastrado (opcional)</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={handleTemplateSupplierChange}
              >
                <SelectTrigger id="template_supplier">
                  <SelectValue placeholder="Selecione um fornecedor cadastrado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Criar fornecedor personalizado</SelectItem>
                  {availableSuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Fornecedor</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Gráfica Rápida"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="supplier_type">Tipo de Fornecedor</Label>
              <Select
                value={formData.supplier_type}
                onValueChange={value => setFormData(prev => ({ ...prev, supplier_type: value }))}
              >
                <SelectTrigger id="supplier_type">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="printing">Gráfica</SelectItem>
                  <SelectItem value="catering">Buffet</SelectItem>
                  <SelectItem value="media">Mídia</SelectItem>
                  <SelectItem value="structure">Estrutura</SelectItem>
                  <SelectItem value="logistics">Logística</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_person">Pessoa de Contato</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={e => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="Ex: João Silva"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ex: (11) 99999-9999"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested">Solicitado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="Ex: 1000.00"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="service_description">Descrição dos Serviços</Label>
            <Textarea
              id="service_description"
              value={formData.service_description}
              onChange={e => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
              placeholder="Descreva os serviços prestados..."
              className="h-24"
            />
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Atualizar" : "Adicionar"} Fornecedor
        </Button>
      </div>
    </form>
  );
}