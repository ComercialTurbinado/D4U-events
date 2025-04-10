import React, { useState, useEffect } from "react";
import { MaterialCategory, Supplier } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Image, Upload } from "lucide-react";
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
    notes: "",
    image_url: ""
  });

  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (initialData?.image_url) {
      setImagePreview(initialData.image_url);
    }
  }, [initialData]);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifica se o arquivo é uma imagem
    if (!file.type.match('image.*')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    setIsUploading(true);

    try {
      // Converte a imagem para base64
      const base64 = await convertToBase64(file);
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image_url: base64 }));
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
      alert('Ocorreu um erro ao processar a imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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

          {/* Campo de Upload de Imagem */}
          <div>
            <Label htmlFor="image_upload">Imagem do Material</Label>
            <div className="flex items-start gap-4 mt-1">
              <div 
                className={`border rounded-md flex items-center justify-center bg-gray-50 w-32 h-32 overflow-hidden ${!imagePreview ? 'border-dashed' : ''}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Imagem do material" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-10 h-10 text-gray-300" />
                )}
              </div>
              
              <div className="flex flex-col">
                <label 
                  htmlFor="image_upload" 
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Processando...' : 'Carregar imagem'}
                </label>
                <input
                  id="image_upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Formatos suportados: JPEG, PNG, GIF. Tamanho máximo: 5MB.
                </p>
              </div>
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
