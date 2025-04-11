import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Promoter } from "@/api/entities";

export default function EventPromoterForm({ eventId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    promoter_id: "",
    quantity: 1,
    unit_cost: 0,
    total_cost: 0,
    notes: "",
  });

  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      const data = await Promoter.list();
      setPromoters(data || []);
    } catch (error) {
      console.error("Erro ao carregar promotores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const promoter = promoters.find(p => p.id === formData.promoter_id);
      if (!promoter) {
        throw new Error("Promotor não encontrado");
      }

      const promoterData = {
        event_id: eventId,
        promoter_id: formData.promoter_id,
        name: promoter.name,
        quantity: formData.quantity,
        unit_cost: formData.unit_cost,
        total_cost: formData.quantity * formData.unit_cost,
        notes: formData.notes,
      };

      await onSubmit(promoterData);
      setFormData({
        promoter_id: "",
        quantity: 1,
        unit_cost: 0,
        total_cost: 0,
        notes: "",
      });
    } catch (error) {
      console.error("Erro ao adicionar promotor:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="promoter_id">Promotor</Label>
            <Select
              value={formData.promoter_id}
              onValueChange={(value) => {
                const promoter = promoters.find(p => p.id === value);
                setFormData(prev => ({
                  ...prev,
                  promoter_id: value,
                  unit_cost: promoter?.reference_value || 0,
                  total_cost: (promoter?.reference_value || 0) * prev.quantity
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um promotor" />
              </SelectTrigger>
              <SelectContent>
                {promoters.map((promoter) => (
                  <SelectItem key={promoter.id} value={promoter.id}>
                    {promoter.name} - {promoter.reference_value?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => {
                const quantity = parseInt(e.target.value) || 1;
                setFormData(prev => ({
                  ...prev,
                  quantity,
                  total_cost: quantity * prev.unit_cost
                }));
              }}
            />
          </div>

          <div>
            <Label htmlFor="unit_cost">Valor Unitário</Label>
            <Input
              id="unit_cost"
              type="number"
              min="0"
              step="0.01"
              value={formData.unit_cost}
              onChange={(e) => {
                const unitCost = parseFloat(e.target.value) || 0;
                setFormData(prev => ({
                  ...prev,
                  unit_cost: unitCost,
                  total_cost: unitCost * prev.quantity
                }));
              }}
            />
          </div>

          <div>
            <Label htmlFor="total_cost">Valor Total</Label>
            <Input
              id="total_cost"
              type="number"
              value={formData.total_cost}
              disabled
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre o promotor no evento"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Adicionar Promotor
        </Button>
      </div>
    </form>
  );
} 