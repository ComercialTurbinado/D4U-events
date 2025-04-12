import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { InfluencerOps, EventInfluencerOps } from "@/api/mongodb";
import { formatCurrency } from "@/lib/utils";

export default function EventInfluencerForm({ event, onSuccess }) {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_id: event.id,
    influencer_id: "",
    fee: "",
    notes: "",
    status: "pending"
  });

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    try {
      setIsLoading(true);
      const data = await InfluencerOps.list();
      setInfluencers(data || []);
    } catch (error) {
      console.error("Erro ao carregar influenciadores:", error);
      toast.error("Erro ao carregar influenciadores");
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

    // Se selecionou um influenciador, preenche o valor de referência
    if (name === "influencer_id") {
      const selectedInfluencer = influencers.find(i => i.id === value);
      if (selectedInfluencer && selectedInfluencer.reference_value) {
        setFormData(prev => ({
          ...prev,
          fee: selectedInfluencer.reference_value.toString()
        }));
        
        console.log(`Valor de referência preenchido: ${selectedInfluencer.reference_value}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.influencer_id) {
      toast.error("Selecione um influenciador");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Adicionando influenciador ao evento:", formData);
      
      // Usando fetch diretamente para garantir que funcione
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event_influencers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Erro ao adicionar influenciador ao evento");
      }
      
      toast.success("Influenciador adicionado com sucesso!");
      
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
        influencer_id: "",
        fee: "",
        notes: "",
        status: "pending"
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar influenciador:", error);
      toast.error("Erro ao adicionar influenciador ao evento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Influenciador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="influencer_id">Influenciador</Label>
            <Select
              value={formData.influencer_id}
              onValueChange={(value) => handleSelectChange("influencer_id", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um influenciador" />
              </SelectTrigger>
              <SelectContent>
                {influencers.map((influencer) => (
                  <SelectItem key={influencer.id} value={influencer.id}>
                    {influencer.name} - {formatCurrency(influencer.reference_value)}
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
            {isLoading ? "Adicionando..." : "Adicionar Influenciador"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 