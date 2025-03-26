
import React, { useState, useEffect } from "react";
import { SupplierCategory } from "@/api/entities";
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

export default function SupplierForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    category_id: "",
    contact_person: "",
    phone: "",
    email: "",
    country: "",
    state: "",
    city: "",
    address: "",
    service_description: "",
    is_active: true
  });

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const supplierCategories = await SupplierCategory.filter({ is_active: true });
      setCategories(supplierCategories);
    } catch (error) {
      console.error("Error loading supplier categories:", error);
    } finally {
      setIsLoadingCategories(false);
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
              <Label htmlFor="category_id">Tipo de Fornecedor</Label>
              <Select
                value={formData.category_id}
                onValueChange={value => setFormData(prev => ({ ...prev, category_id: value }))}
                required
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Selecione um tipo" />
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ex: contato@exemplo.com"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Fornecedor Ativo</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Ex: Brasil"
              />
            </div>
            
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Ex: São Paulo"
              />
            </div>
            
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Ex: São Paulo"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Ex: Rua Exemplo, 123 - Bairro"
            />
          </div>
          
          <div>
            <Label htmlFor="service_description">Descrição dos Serviços</Label>
            <Textarea
              id="service_description"
              value={formData.service_description}
              onChange={e => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
              placeholder="Detalhe os serviços prestados por este fornecedor..."
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
          {initialData ? "Atualizar" : "Criar"} Fornecedor
        </Button>
      </div>
    </form>
  );
}
