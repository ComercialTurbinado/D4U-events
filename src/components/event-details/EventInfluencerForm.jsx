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

export default function EventInfluencerForm({ event, onSuccess, editingItem }) {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_id: event.id,
    influencer_id: "",
    fee: "",
    days: "1",
    total_fee: "",
    notes: "",
    status: "pending"
  });

  useEffect(() => {
    loadInfluencers();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        event_id: event.id,
        influencer_id: editingItem.influencer_id,
        fee: editingItem.fee ? editingItem.fee.toString() : "",
        days: editingItem.days ? editingItem.days.toString() : "1",
        total_fee: editingItem.total_fee ? editingItem.total_fee.toString() : "",
        notes: editingItem.notes || "",
        status: editingItem.status || "pending"
      });
    }
  }, [editingItem, event.id]);

  useEffect(() => {
    // Atualiza o valor total quando o fee ou os dias mudam
    const feeValue = parseFloat(formData.fee) || 0;
    const daysValue = parseFloat(formData.days) || 1;
    const total = feeValue * daysValue;
    
    console.log(`Calculando total: ${feeValue} * ${daysValue} = ${total}`);
    
    setFormData(prev => ({
      ...prev,
      total_fee: total.toString()
    }));
  }, [formData.fee, formData.days]);

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

    // Garantir que days e total_fee estejam definidos
    const days = formData.days || "1";
    const fee = formData.fee || "0";
    const total_fee = formData.total_fee || (parseFloat(fee) * parseFloat(days)).toString();

    // Criar objeto com todos os campos obrigatórios
    const dataToSend = {
      ...formData,
      days,
      total_fee
    };

    console.log("Dados completos a serem enviados:", JSON.stringify(dataToSend, null, 2));

    setIsLoading(true);
    try {
      // Verificar se é uma edição ou uma adição
      if (editingItem) {
        console.log("Atualizando influenciador no evento:", dataToSend);
        
        // Atualizar o evento-influenciador
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event-influencer/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro na resposta:", errorText);
          throw new Error("Erro ao atualizar influenciador no evento");
        }
        
        toast.success("Influenciador atualizado com sucesso!");
        
      } else {
        // Código existente para adição de novo influenciador
        console.log("Adicionando influenciador ao evento:", dataToSend);
        
        // Usando fetch diretamente para garantir que funcione
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event-influencer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro na resposta:", errorText);
          throw new Error("Erro ao adicionar influenciador ao evento");
        }
        
        toast.success("Influenciador adicionado com sucesso!");
      }
      
      // Reset do formulário e retorno
      setFormData({
        event_id: event.id,
        influencer_id: "",
        fee: "",
        days: "1",
        total_fee: "",
        notes: "",
        status: "pending"
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar influenciador:", error);
      toast.error(`Erro ao ${editingItem ? 'atualizar' : 'adicionar'} influenciador ao evento`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingItem ? "Editar Influenciador" : "Adicionar Influenciador"}</CardTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee">Valor da diária</Label>
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
              <Label htmlFor="days">Dias</Label>
              <Input
                id="days"
                name="days"
                type="number"
                min="1"
                step="1"
                value={formData.days}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_fee">Valor Total</Label>
            <Input
              id="total_fee"
              name="total_fee"
              type="number"
              step="0.01"
              value={formData.total_fee}
              onChange={handleChange}
              disabled={true}
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
            {isLoading ? (editingItem ? "Atualizando..." : "Adicionando...") : (editingItem ? "Atualizar Influenciador" : "Adicionar Influenciador")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 