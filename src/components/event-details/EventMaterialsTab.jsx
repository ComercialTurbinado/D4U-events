import React, { useState, useEffect } from "react";
import { EventMaterial, Material, Supplier, DefaultMaterial } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Package, Save, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import EventMaterialForm from "./EventMaterialForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EventMaterialsTab({ eventId, eventTypeId }) {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [availableTypeMaterials, setAvailableTypeMaterials] = useState([]);
  const [materialStock, setMaterialStock] = useState({});
  const [editableQuantities, setEditableQuantities] = useState({});
  const [editableCosts, setEditableCosts] = useState({});
  const [suppliers, setSuppliers] = useState({});

  useEffect(() => {
    loadMaterials();
    loadSuppliers();
  }, [eventId]);

  const loadMaterials = async () => {
    try {
      // Carregar materiais do evento
      const eventMaterials = await EventMaterial.list();
      const materialsForEvent = eventMaterials.filter(em => em.event_id === eventId);
      setMaterials(materialsForEvent);

      // Carregar todos os materiais disponíveis
      const allMaterials = await Material.list();
      setAvailableMaterials(allMaterials);

      // Carregar materiais padrão do tipo de evento
      const defaultMaterials = await DefaultMaterial.list();
      const enrichedTypeMaterials = defaultMaterials
        .filter(dm => dm.event_type_id === eventTypeId)
        .map(dm => ({
          ...dm,
          material: allMaterials.find(m => m.id === dm.material_id)
        }));

      setAvailableTypeMaterials(enrichedTypeMaterials);
    } catch (error) {
      console.error("Error loading materials:", error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const supplierList = await Supplier.list();
      const supplierMap = {};
      supplierList.forEach(s => {
        supplierMap[s.id] = s;
      });
      setSuppliers(supplierMap);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const handleCreateMaterial = async (materialData) => {
    await EventMaterial.create({
      ...materialData,
      event_id: eventId
    });
    setShowForm(false);
    loadMaterials();
  };

  const handleUpdateMaterial = async (id, materialData) => {
    await EventMaterial.update(id, materialData);
    setShowForm(false);
    setEditingMaterial(null);
    loadMaterials();
  };

  const handleDeleteMaterial = async (id) => {
    await EventMaterial.delete(id);
    loadMaterials();
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleImportFromEventType = async () => {
    if (!eventTypeId) return;
    
    setIsLoading(true);
    try {
      const defaultMaterials = await DefaultMaterial.filter({ event_type_id: eventTypeId });
      
      const existingMaterialIds = materials
        .filter(m => m.material_id)
        .map(m => m.material_id);
      
      for (const defaultMaterial of defaultMaterials) {
        if (existingMaterialIds.includes(defaultMaterial.material_id)) continue;
        
        const materialDetails = await Material.get(defaultMaterial.material_id);
        
        if (!materialDetails) continue;
        
        await EventMaterial.create({
          event_id: eventId,
          material_id: defaultMaterial.material_id,
          name: materialDetails.name,
          quantity: defaultMaterial.default_quantity || materialDetails.default_quantity || 1,
          status: "pending",
          notes: materialDetails.notes,
          unit_cost: materialDetails.initial_purchase_cost 
            ? materialDetails.initial_purchase_cost / (materialDetails.initial_purchase_quantity || 1) 
            : 0,
          supplier_id: materialDetails.supplier_id || ""
        });
      }
      
      loadMaterials();
    } catch (error) {
      console.error("Error importing default materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (materialId, newStatus) => {
    try {
      const material = materials.find(m => m.id === materialId);
      if (!material) return;
      
      await EventMaterial.update(materialId, {
        ...material,
        status: newStatus
      });
      
      loadMaterials();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleQuantityChange = (id, value) => {
    const newQuantity = parseInt(value) || 0;
    setEditableQuantities({
      ...editableQuantities,
      [id]: newQuantity
    });
    
    // Ajustar o custo total proporcionalmente se a quantidade mudou
    const material = materials.find(m => m.id === id);
    if (material && material.unit_cost) {
      setEditableCosts({
        ...editableCosts,
        [id]: material.unit_cost * newQuantity
      });
    }
  };

  const handleCostChange = (id, value) => {
    const newCost = parseFloat(value) || 0;
    setEditableCosts({
      ...editableCosts,
      [id]: newCost
    });
  };

  const saveQuantity = async (id) => {
    const material = materials.find(m => m.id === id);
    if (!material) return;
    
    const newQuantity = editableQuantities[id];
    
    // Verificar se há estoque suficiente
    const stockInfo = materialStock[material.material_id];
    if (stockInfo && stockInfo.currentStock < newQuantity) {
      alert(`Atenção: Estoque insuficiente! Disponível: ${stockInfo.currentStock} ${stockInfo.name}`);
    }
    
    // Calcular novo custo unitário baseado no custo total
    const totalCost = editableCosts[id] || 0;
    const unitCost = newQuantity > 0 ? totalCost / newQuantity : 0;
    
    await EventMaterial.update(id, {
      ...material,
      quantity: newQuantity,
      unit_cost: unitCost
    });
    
    loadMaterials();
  };

  const saveCost = async (id) => {
    const material = materials.find(m => m.id === id);
    if (!material) return;
    
    const totalCost = editableCosts[id] || 0;
    const unitCost = material.quantity > 0 ? totalCost / material.quantity : 0;
    
    await EventMaterial.update(id, {
      ...material,
      unit_cost: unitCost
    });
    
    loadMaterials();
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "Pendente",
      ordered: "Encomendado",
      received: "Recebido",
      cancelled: "Cancelado"
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      ordered: "bg-blue-100 text-blue-800",
      received: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const isStockLow = (materialId, quantity) => {
    const stock = materialStock[materialId];
    return stock && stock.currentStock < quantity;
  };

  const calculateTotalCost = (material) => {
    if (!material.unit_cost) return 0;
    return material.unit_cost * material.quantity;
  };

  const getSupplierInfo = (material) => {
    if (material.supplier_id) {
      const supplier = suppliers[material.supplier_id];
      return supplier ? (
        <div className="flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          <span>{supplier.name}</span>
        </div>
      ) : null;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {showForm ? (
        <EventMaterialForm
          initialData={editingMaterial}
          availableMaterials={availableMaterials}
          onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial}
          onCancel={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Materiais do Evento</h2>
            <div className="flex gap-2">
              {eventTypeId && (
                <Button 
                  variant="outline" 
                  onClick={handleImportFromEventType}
                  disabled={isLoading}
                >
                  Importar do Tipo de Evento
                </Button>
              )}
              <Button 
                onClick={() => {
                  setEditingMaterial(null);
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Material
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Custo Total</TableHead>
                  <TableHead className="w-28">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Carregando materiais...
                    </TableCell>
                  </TableRow>
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum material cadastrado para este evento
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => (
                    <TableRow key={material.id} className={
                      isStockLow(material.material_id, material.quantity) ? "bg-red-50" : ""
                    }>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          {material.name}
                          {material.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-xs text-gray-500 truncate max-w-[180px]">
                                    {material.notes}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{material.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min="1"
                            value={editableQuantities[material.id] || material.quantity}
                            onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                            onBlur={() => saveQuantity(material.id)}
                            className="w-20 h-8"
                          />
                          {isStockLow(material.material_id, material.quantity) && (
                            <span className="ml-2 text-xs text-red-600 font-medium">
                              Estoque insuficiente! ({materialStock[material.material_id]?.currentStock || 0})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSupplierInfo(material) || (
                          <Badge variant="outline" className="text-gray-500">
                            Não definido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={material.status}
                          onValueChange={(value) => handleStatusChange(material.id, value)}
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="ordered">Encomendado</SelectItem>
                            <SelectItem value="received">Recebido</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">R$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editableCosts[material.id] || calculateTotalCost(material)}
                            onChange={(e) => handleCostChange(material.id, e.target.value)}
                            onBlur={() => saveCost(material.id)}
                            className="w-20 h-8"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(material)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMaterial(material.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Resumo de custos */}
          {materials.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">Detalhamento de Custos</h3>
              <div className="space-y-2">
                {materials.map(material => (
                  material.unit_cost ? (
                    <div key={material.id} className="flex justify-between">
                      <span>{material.name} ({material.quantity} unid.)</span>
                      <span>R$ {calculateTotalCost(material).toFixed(2)}</span>
                    </div>
                  ) : null
                ))}
                <div className="pt-2 border-t border-gray-200 font-medium text-lg flex justify-between">
                  <span>Total</span>
                  <span>R$ {materials.reduce((sum, material) => sum + calculateTotalCost(material), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}