import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventInfluencer, Influencer } from "@/api/entities";
import { ComboBox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";

export default function EventInfluencerForm({ eventId, influencer, onSubmit, onCancel }) {
  const [influencers, setInfluencers] = useState([]);
  const [formData, setFormData] = useState({
    event_id: eventId,
    influencer_id: influencer?.influencer_id || "",
    quantity: influencer?.quantity || 1,
    unit_cost: influencer?.unit_cost || 0,
    total_cost: influencer?.total_cost || 0,
    notes: influencer?.notes || "",
  });

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    try {
      const data = await Influencer.list();
      setInfluencers(data.map(inf => ({
        value: inf.id,
        label: inf.name
      })));
    } catch (error) {
      console.error("Erro ao carregar influenciadores:", error);
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
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Influenciador</CardTitle>
        <CardDescription>
          Adicione um influenciador ao evento e defina seus custos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Influenciador</Label>
            <ComboBox
              options={influencers}
              value={formData.influencer_id}
              onValueChange={(value) => handleChange("influencer_id", value)}
              placeholder="Selecione um influenciador"
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
              placeholder="Adicione observações sobre o influenciador..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {influencer ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 