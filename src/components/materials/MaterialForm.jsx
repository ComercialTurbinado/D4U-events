import React, { useState, useEffect } from "react";
import { MaterialCategory, Supplier } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function MaterialForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    default_quantity: 1,
    track_inventory: true,
    current_stock: 0,
    category_id: "",
    supplier_id: "",
    initial_purchase_quantity: "",
    initial_purchase_cost: "",
    storage_country: "",
    notes: ""
  });

  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);

  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const materialCategories = await MaterialCategory.list();
      const activeCategories = materialCategories.filter(category => category.is_active);
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error loading material categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const suppliers = await Supplier.list();
      const activeSuppliers = suppliers.filter(supplier => supplier.is_active);
      setSuppliers(activeSuppliers);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setIsLoadingSuppliers(false);
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
              <Label htmlFor="name">Nome do Material</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Camiseta personalizada"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category_id">Categoria</Label>
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier_id">Fornecedor</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={value => setFormData(prev => ({ ...prev, supplier_id: value }))}
              >
                <SelectTrigger id="supplier_id">
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="storage_country">País do Estoque</Label>
              <Input
                id="storage_country"
                value={formData.storage_country}
                onChange={e => setFormData(prev => ({ ...prev, storage_country: e.target.value }))}
                placeholder="Ex: Brasil"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initial_purchase_quantity">Quantidade da Primeira Compra</Label>
              <Input
                id="initial_purchase_quantity"
                type="number"
                min="0"
                value={formData.initial_purchase_quantity}
                onChange={e => setFormData(prev => ({ ...prev, initial_purchase_quantity: parseInt(e.target.value) }))}
                placeholder="Ex: 100"
              />
            </div>
            
            <div>
              <Label htmlFor="initial_purchase_cost">Custo Total da Primeira Compra (R$)</Label>
              <Input
                id="initial_purchase_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.initial_purchase_cost}
                onChange={e => setFormData(prev => ({ ...prev, initial_purchase_cost: parseFloat(e.target.value) }))}
                placeholder="Ex: 1000.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_quantity">Quantidade Padrão</Label>
              <Input
                id="default_quantity"
                type="number"
                min="1"
                value={formData.default_quantity}
                onChange={e => setFormData(prev => ({ ...prev, default_quantity: parseInt(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="current_stock">Estoque Atual</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={e => setFormData(prev => ({ ...prev, current_stock: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="track_inventory"
              checked={formData.track_inventory}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, track_inventory: checked }))}
            />
            <Label htmlFor="track_inventory">Controlar Estoque</Label>
          </div>
          
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Detalhes adicionais sobre o material..."
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
          {initialData ? "Atualizar" : "Criar"} Material
        </Button>
      </div>
    </form>
  );
}
