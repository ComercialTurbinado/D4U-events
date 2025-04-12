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

export default function EventPromoterForm({ event, onSuccess, editingItem }) {
  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_id: event.id,
    promoter_id: "",
    fee: "",
    days: "1",
    total_fee: "",
    notes: "",
    status: "pending"
  });

  useEffect(() => {
    loadPromoters();
  }, []);

  useEffect(() => {
    // Atualiza o valor total quando o fee ou os dias mudam
    const feeValue = parseFloat(formData.fee) || 0;
    const daysValue = parseFloat(formData.days) || 1;
    const total = feeValue * daysValue;
    
    console.log(`Calculando total para promoter: ${feeValue} * ${daysValue} = ${total}`);
    
    setFormData(prev => ({
      ...prev,
      total_fee: total.toString()
    }));
  }, [formData.fee, formData.days]);

  // Se tiver um item em edição, carrega os dados
  useEffect(() => {
    if (editingItem) {
      setFormData({
        event_id: event.id,
        promoter_id: editingItem.promoter_id,
        fee: editingItem.fee ? editingItem.fee.toString() : "",
        days: editingItem.days ? editingItem.days.toString() : "1",
        total_fee: editingItem.total_fee ? editingItem.total_fee.toString() : "",
        notes: editingItem.notes || "",
        status: editingItem.status || "pending"
      });
    }
  }, [editingItem, event.id]);

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

    console.log("Dados completos do promoter a serem enviados:", JSON.stringify(dataToSend, null, 2));

    setIsLoading(true);
    try {
      // Verificar se é uma edição ou uma adição
      if (editingItem) {
        console.log("Atualizando promoter no evento:", dataToSend);
        
        // Cálculo da diferença para o orçamento
        const oldTotal = parseFloat(editingItem.total_fee) || 0;
        const newTotal = parseFloat(dataToSend.total_fee) || 0;
        const budgetDiff = newTotal - oldTotal;
        
        // Atualizar o evento-promoter
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event-promoter/${editingItem.id}`, {
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
          throw new Error("Erro ao atualizar promoter no evento");
        }
        
        toast.success("Promoter atualizado com sucesso!");
        
        // Atualizar o orçamento total do evento com a diferença
        if (event && budgetDiff !== 0) {
          try {
            const currentBudget = parseFloat(event.budget) || 0;
            const newBudget = currentBudget + budgetDiff;
            
            console.log(`Atualizando orçamento do evento: ${currentBudget} + ${budgetDiff} = ${newBudget}`);
            
            const updateResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/events/${event.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                ...event,
                budget: Math.max(0, newBudget)  // Garantir que o orçamento não seja negativo
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
      } else {
        // Código existente para adição de novo promoter
        console.log("Adicionando promoter ao evento:", dataToSend);
        
        // Usando fetch diretamente para garantir que funcione
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event-promoter`, {
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
          throw new Error("Erro ao adicionar promoter ao evento");
        }
        
        toast.success("Promoter adicionado com sucesso!");
        
        // Atualizar o orçamento total do evento
        if (event && dataToSend.total_fee) {
          try {
            const totalFeeValue = parseFloat(dataToSend.total_fee) || 0;
            const currentBudget = parseFloat(event.budget) || 0;
            const newBudget = currentBudget + totalFeeValue;
            
            console.log(`Atualizando orçamento do evento: ${currentBudget} + ${totalFeeValue} = ${newBudget}`);
            
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
      }
      
      // Reset do formulário e retorno
      setFormData({
        event_id: event.id,
        promoter_id: "",
        fee: "",
        days: "1",
        total_fee: "",
        notes: "",
        status: "pending"
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar promoter:", error);
      toast.error(`Erro ao ${editingItem ? 'atualizar' : 'adicionar'} promoter ao evento`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingItem ? "Editar Promoter" : "Adicionar Promoter"}</CardTitle>
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
            {isLoading ? (editingItem ? "Atualizando..." : "Adicionando...") : (editingItem ? "Atualizar Promoter" : "Adicionar Promoter")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 