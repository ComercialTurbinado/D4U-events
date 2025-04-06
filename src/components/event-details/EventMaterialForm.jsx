
import React, { useState, useEffect } from "react";
import { Material, EventMaterial } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function EventMaterialForm({ initialData, availableMaterials, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    material_id: initialData?.material_id || "",
    name: initialData?.name || "",
    quantity: initialData?.quantity || 1,
    total_cost: initialData?.total_cost || "",
    supplier_id: initialData?.supplier_id || "",
    status: initialData?.status || "pending",
    notes: initialData?.notes || ""
  });

  const [stockInfo, setStockInfo] = useState(null);
  const [allReservations, setAllReservations] = useState([]);

  useEffect(() => {
    if (formData.material_id) {
      loadMaterialStock(formData.material_id);
      loadEventReservations(formData.material_id);
    }
  }, [formData.material_id]);

  const loadMaterialStock = async (materialId) => {
    try {
      const material = await Material.get(materialId);
      setStockInfo(material);
    } catch (error) {
      console.error("Erro ao buscar material:", error);
    }
  };

  const loadEventReservations = async (materialId) => {
    try {
      const all = await EventMaterial.list();
      setAllReservations(all.filter(em => em.material_id === materialId));
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
    }
  };

  const getAvailableStock = () => {
    const totalStock = stockInfo?.current_stock || 0;
    const reservedByOthers = allReservations
      .filter(r => r.event_id !== initialData?.event_id)
      .reduce((sum, r) => sum + (r.quantity || 0), 0);
    return totalStock - reservedByOthers;
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="material_id">Material Base (Opcional)</Label>
          <Select
            value={formData.material_id}
            onValueChange={(value) => handleChange("material_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {availableMaterials.map((mat) => (
                <SelectItem key={mat.id} value={mat.id}>{mat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="name">Nome do Material</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Camiseta, Caneta, etc."
          />
        </div>
      </div>

      {stockInfo && (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="font-semibold text-blue-700">Informações do Estoque</p>
          <p>
            Estoque atual: <strong>{stockInfo.current_stock} unidades</strong>
          </p>
          <p>
            Reservado por outros eventos: <strong>{allReservations.filter(r => r.event_id !== initialData?.event_id).reduce((sum, r) => sum + r.quantity, 0)} unidades</strong>
          </p>
          <p>
            Disponível: <strong>{getAvailableStock()} unidades</strong>
          </p>
          {getAvailableStock() < formData.quantity && (
            <p className="text-red-600 font-semibold mt-2">
              Atenção: Estoque insuficiente para a quantidade solicitada!
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            type="number"
            id="quantity"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", parseInt(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="total_cost">Custo Total (R$)</Label>
          <Input
            id="total_cost"
            value={formData.total_cost}
            onChange={(e) => handleChange("total_cost", e.target.value)}
            placeholder="Valor total"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value)}
        >
          <SelectTrigger>
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
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Observações adicionais sobre o material"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
