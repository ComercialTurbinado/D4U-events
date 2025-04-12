import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Promoter } from "@/api/entities";
import { ComboBox } from "@/components/ui/combobox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { PromoterOps, EventPromoterOps } from "@/api/mongodb";
import { formatCurrency } from "@/lib/utils";

export default function EventPromoterForm({ event, onSuccess }) {
  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_id: event.id,
    promoter_id: "",
    fee: "",
    notes: "",
    status: "pending"
  });

  useEffect(() => {
    loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      setIsLoading(true);
      const data = await PromoterOps.list();
      setPromoters(data || []);
    } catch (error) {
      console.error("Erro ao carregar promoters:", error);
      toast.error("Erro ao carregar promoters");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Se selecionou um promoter, preenche o valor de referência
    if (name === "promoter_id") {
      const selectedPromoter = promoters.find(p => p.id === value);
      if (selectedPromoter && selectedPromoter.reference_value) {
        setFormData(prev => ({
          ...prev,
          fee: selectedPromoter.reference_value.toString()
        }));
        
        console.log(`Valor de referência preenchido: ${selectedPromoter.reference_value}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.promoter_id) {
      toast.error("Selecione um promoter");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Adicionando promoter ao evento:", formData);
      
      // Usando fetch diretamente para garantir que funcione
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event_promoters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao adicionar promoter ao evento");
      }
      
      toast.success("Promoter adicionado com sucesso!");
      
      // Atualizar o orçamento total do evento
      if (event && formData.fee) {
        try {
          const feeValue = parseFloat(formData.fee) || 0;
          const currentBudget = parseFloat(event.budget) || 0;
          const newBudget = currentBudget + feeValue;
          
          console.log(`Atualizando orçamento do evento: ${currentBudget} + ${feeValue} = ${newBudget}`);
          
          const updateResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/events/${event.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              ...event,
              budget: newBudget
            })
          });
          
          if (!updateResponse.ok) {
            console.error("Erro ao atualizar orçamento do evento:", await updateResponse.text());
          } else {
            console.log("Orçamento do evento atualizado com sucesso!");
          }
        } catch (error) {
          console.error("Erro ao atualizar orçamento do evento:", error);
        }
      }
      
      setFormData({
        event_id: event.id,
        promoter_id: "",
        fee: "",
        notes: "",
        status: "pending"
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar promoter:", error);
      toast.error("Erro ao adicionar promoter ao evento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Promoter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promoter_id">Promoter</Label>
            <Select
              value={formData.promoter_id}
              onValueChange={(value) => handleSelectChange("promoter_id", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um promoter" />
              </SelectTrigger>
              <SelectContent>
                {promoters.map((promoter) => (
                  <SelectItem key={promoter.id} value={promoter.id}>
                    {promoter.name} - {formatCurrency(promoter.reference_value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">Valor</Label>
            <Input
              id="fee"
              name="fee"
              type="number"
              step="0.01"
              value={formData.fee}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adicionando..." : "Adicionar Promoter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 