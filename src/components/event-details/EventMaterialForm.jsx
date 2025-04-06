import React, { useState, useEffect } from "react";
import { Material, Supplier } from "@/api/entities";
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
import { Briefcase, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EventMaterialForm({ initialData, availableMaterials, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    material_id: "",
    quantity: 1,
    status: "pending",
    notes: "",
    unit_cost: 0,
    supplier_id: ""
  });
  
  const [materialDetails, setMaterialDetails] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [totalCost, setTotalCost] = useState(initialData?.unit_cost * initialData?.quantity || 0);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  
  useEffect(() => {
    loadSuppliers();
    if (initialData?.material_id) {
      loadMaterialDetails(initialData.material_id);
    }
    
    if (initialData) {
      setTotalCost(initialData.unit_cost * initialData.quantity || 0);
    }
  }, [initialData]);
  
  const loadMaterialDetails = async (materialId) => {
    try {
      const material = await Material.get(materialId);
      setMaterialDetails(material);
    } catch (error) {
      console.error("Erro ao carregar detalhes do material:", error);
    }
  };
  
  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const allSuppliers = await Supplier.list();
      const supplierList = allSuppliers.filter(supplier => supplier.is_active);
      setSuppliers(supplierList);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const unitCost = formData.quantity > 0 ? totalCost / formData.quantity : 0;
    
    const updatedFormData = {
      ...formData,
      unit_cost: unitCost,
      total_cost: totalCost
    };

    if (!initialData && !formData.material_id) {
      setPendingSubmission(updatedFormData);
      setShowStockDialog(true);
      return;
    }
    
    if (initialData) {
      onSubmit(initialData.id, updatedFormData);
    } else {
      // Verificar se há estoque suficiente
      if (formData.material_id) {
        try {
          // Buscar os detalhes completos do material
          const materialDetails = await Material.get(formData.material_id);
          
          if (materialDetails && materialDetails.track_inventory) {
            const availableStock = materialDetails.current_stock - (materialDetails.reserved_stock || 0);
            console.log('Verificando estoque:', {
              materialId: materialDetails.id,
              currentStock: materialDetails.current_stock,
              reservedStock: materialDetails.reserved_stock || 0,
              availableStock,
              requestedQuantity: formData.quantity
            });

            if (availableStock < formData.quantity) {
              alert(`Estoque disponível insuficiente! Estoque disponível: ${availableStock}, Quantidade solicitada: ${formData.quantity}`);
              return;
            }
            
            // Atualizar o estoque antes de adicionar o material ao evento
            const newReservedStock = (materialDetails.reserved_stock || 0) + formData.quantity;
            console.log('Atualizando estoque reservado:', {
              materialId: materialDetails.id,
              newReservedStock
            });
            
            await Material.update(materialDetails.id, {
              reserved_stock: newReservedStock
            });
            
            console.log('Estoque reservado atualizado com sucesso!');
          }
          
          // Adicionar o material ao evento
          onSubmit(updatedFormData);
        } catch (error) {
          console.error("Erro ao atualizar estoque:", error);
          alert("Erro ao atualizar o estoque. Por favor, tente novamente.");
          return;
        }
      } else {
        onSubmit(updatedFormData);
      }
    }
  };

  const handleAddToStock = async () => {
    if (!pendingSubmission) return;

    try {
      const newMaterial = await Material.create({
        name: pendingSubmission.name,
        default_quantity: pendingSubmission.quantity,
        track_inventory: true,
        current_stock: pendingSubmission.quantity,
        supplier_id: pendingSubmission.supplier_id,
        notes: pendingSubmission.notes,
        initial_purchase_quantity: pendingSubmission.quantity,
        initial_purchase_cost: totalCost
      });

      const updatedFormData = {
        ...pendingSubmission,
        material_id: newMaterial.id
      };

      onSubmit(updatedFormData);
    } catch (error) {
      console.error("Erro ao adicionar material ao estoque:", error);
      onSubmit(pendingSubmission);
    } finally {
      setShowStockDialog(false);
      setPendingSubmission(null);
    }
  };

  const handleSkipStock = () => {
    if (!pendingSubmission) return;
    onSubmit(pendingSubmission);
    setShowStockDialog(false);
    setPendingSubmission(null);
  };

  const handleMaterialSelect = async (materialId) => {
    try {
      const material = availableMaterials.find(m => m.id === materialId);
      if (material) {
        const unitCost = material.initial_purchase_cost 
          ? material.initial_purchase_cost / (material.initial_purchase_quantity || 1) 
          : 0;
          
        const quantity = material.default_quantity || 1;
        const calculatedTotalCost = unitCost * quantity;
        
        setFormData({
          ...formData,
          material_id: materialId,
          name: material.name,
          quantity: quantity,
          notes: material.notes || "",
          unit_cost: unitCost,
          supplier_id: material.supplier_id || "none"
        });
        
        setTotalCost(calculatedTotalCost);
        setMaterialDetails(material);
      }
    } catch (error) {
      console.error("Erro ao selecionar material:", error);
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value) || 0;
    setFormData(prev => {
      const updatedData = { ...prev, quantity: newQuantity };
      // Atualizar o custo total quando a quantidade muda
      const unitCost = totalCost / (prev.quantity || 1);
      setTotalCost(unitCost * newQuantity);
      return updatedData;
    });

    // Verificar estoque disponível
    if (materialDetails && materialDetails.track_inventory) {
      const availableStock = materialDetails.current_stock - (materialDetails.reserved_stock || 0);
      if (availableStock < newQuantity) {
        console.log('Estoque insuficiente:', {
          availableStock,
          requestedQuantity: newQuantity
        });
      }
    }
  };

  const handleTotalCostChange = (value) => {
    const newTotalCost = parseFloat(value) || 0;
    setTotalCost(newTotalCost);
    // Atualizar o custo unitário no formData
    if (formData.quantity > 0) {
      const unitCost = newTotalCost / formData.quantity;
      setFormData(prev => ({ ...prev, unit_cost: unitCost }));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMaterials && availableMaterials.length > 0 && (
                <div>
                  <Label htmlFor="material_template">Material Base (Opcional)</Label>
                  <Select
                    value={formData.material_id}
                    onValueChange={handleMaterialSelect}
                  >
                    <SelectTrigger id="material_template">
                      <SelectValue placeholder="Selecione um material base" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map(material => (
                        <SelectItem key={material.id} value={material.id}>{material.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Selecione um material base para preencher os campos automaticamente
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="name">Nome do Material</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do material"
                  required
                />
              </div>
            </div>

            {materialDetails && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700 font-medium">Informações do Estoque</p>
                <p className="text-sm">
                  Estoque total: <span className="font-medium">{materialDetails.current_stock || 0} unidades</span>
                </p>
                <p className="text-sm">
                  Estoque disponível: <span className="font-medium">{materialDetails.current_stock - materialDetails.reserved_stock || 0} unidades</span>
                </p>
                {materialDetails.track_inventory && (materialDetails.current_stock - materialDetails.reserved_stock) < formData.quantity && (
                  <p className="text-sm text-red-600 mt-1">
                    Atenção: Estoque disponível insuficiente para a quantidade solicitada!
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  placeholder="Quantidade necessária"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="total_cost">Custo Total (R$)</Label>
                <Input
                  id="total_cost"
                  type="number"
                  min="0"
                  step="0.01"
                   onChange={e => handleTotalCostChange(e.target.value)}
                  placeholder="Valor total"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="supplier_id">Fornecedor</Label>
              <Select
                value={formData.supplier_id || "none"}
                onValueChange={value => setFormData(prev => ({ 
                  ...prev, 
                  supplier_id: value === "none" ? null : value 
                }))}
              >
                <SelectTrigger id="supplier_id">
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum fornecedor</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="ordered">Encomendado</SelectItem>
                  <SelectItem value="received">Recebido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais sobre o material"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {initialData ? "Atualizar Material" : "Adicionar Material"}
            </Button>
          </div>
        </Card>
      </form>

      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar ao Estoque?</DialogTitle>
            <DialogDescription>
              Deseja adicionar este material ao catálogo de materiais? 
              Isso permitirá reutilizá-lo em outros eventos e controlar seu estoque.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleSkipStock}>
              Não, apenas para este evento
            </Button>
            <Button 
              type="button" 
              onClick={handleAddToStock}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sim, adicionar ao estoque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
