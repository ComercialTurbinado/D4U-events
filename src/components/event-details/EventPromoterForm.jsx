import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Promoter } from "@/api/entities";
import { ComboBox } from "@/components/ui/combobox";

export default function EventPromoterForm({ eventId, promoter, onSubmit, onCancel }) {
  const [promoters, setPromoters] = useState([]);
  const [formData, setFormData] = useState({
    event_id: eventId,
    promoter_id: promoter?.promoter_id || "",
    quantity: promoter?.quantity || 1,
    unit_cost: promoter?.unit_cost || 0,
    total_cost: promoter?.total_cost || 0,
    notes: promoter?.notes || "",
  });

  useEffect(() => {
    loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      const data = await Promoter.list();
      setPromoters(data.map(prom => ({
        value: prom.id,
        label: prom.name
      })));
    } catch (error) {
      console.error("Erro ao carregar promoters:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Atualiza o valor total quando quantidade ou valor unitário mudam
      if (field === "quantity" || field === "unit_cost") {
        newData.total_cost = Number(newData.quantity) * Number(newData.unit_cost);
      }
      
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Promoter</Label>
        <ComboBox
          options={promoters}
          value={formData.promoter_id}
          onValueChange={(value) => handleChange("promoter_id", value)}
          placeholder="Selecione um promoter"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Valor Unitário (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.unit_cost}
            onChange={(e) => handleChange("unit_cost", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Valor Total (R$)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.total_cost}
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Adicione observações sobre o promoter..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {promoter ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
} 