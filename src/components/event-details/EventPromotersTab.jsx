import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { EventPromoterOps, PromoterOps } from "@/api/mongodb";
import { formatCurrency } from "@/lib/utils";
import EventPromoterForm from "./EventPromoterForm";

export default function EventPromotersTab({ event, onSuccess }) {
  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadEventPromoters();
  }, [event]);

  const loadEventPromoters = async () => {
    try {
      setIsLoading(true);
      // Busca os promoters associados ao evento
      const data = await fetch(
        `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/event_promoters?event_id=${event.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!data.ok) {
        throw new Error("Erro ao carregar promoters do evento");
      }

      const eventPromoters = await data.json();

      // Para cada promoter do evento, busca os detalhes do promoter
      const populatedPromoters = await Promise.all(
        eventPromoters.map(async (item) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/promoters/${item.promoter_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (!response.ok) {
              console.error(`Erro ao buscar detalhes do promoter ${item.promoter_id}`);
              return { ...item, promoter: { name: "Promoter não encontrado" } };
            }

            const promoter = await response.json();
            return { ...item, promoter };
          } catch (error) {
            console.error(`Erro ao processar promoter ${item.promoter_id}:`, error);
            return { ...item, promoter: { name: "Erro ao carregar detalhes" } };
          }
        })
      );

      setPromoters(populatedPromoters);
    } catch (error) {
      console.error("Erro ao carregar promoters do evento:", error);
      toast.error("Erro ao carregar promoters do evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, fee) => {
    if (window.confirm("Tem certeza que deseja remover este promoter do evento?")) {
      try {
        setIsLoading(true);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/event_promoters/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao remover promoter do evento");
        }

        // Atualizar o orçamento total do evento
        if (event && fee) {
          try {
            const feeValue = parseFloat(fee) || 0;
            const currentBudget = parseFloat(event.budget) || 0;
            const newBudget = Math.max(0, currentBudget - feeValue); // Garantir que não fique negativo
            
            console.log(`Atualizando orçamento do evento: ${currentBudget} - ${feeValue} = ${newBudget}`);
            
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

        toast.success("Promoter removido com sucesso");
        loadEventPromoters();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Erro ao remover promoter:", error);
        toast.error("Erro ao remover promoter do evento");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadEventPromoters();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="mb-6">
          <EventPromoterForm event={event} onSuccess={handleFormSuccess} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Promoter
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Promoters do Evento</CardTitle>
          <CardDescription>Gerenciar os promoters associados a este evento</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : promoters.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum promoter associado a este evento
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoters.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.promoter?.name}</TableCell>
                    <TableCell>{formatCurrency(item.fee)}</TableCell>
                    <TableCell>
                      <div className="capitalize">{item.status}</div>
                    </TableCell>
                    <TableCell>{item.notes}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id, item.fee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 