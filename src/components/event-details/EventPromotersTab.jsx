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
  const [editingItem, setEditingItem] = useState(null);

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

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id, totalFee) => {
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
        if (event && totalFee) {
          try {
            const feeValue = parseFloat(totalFee) || 0;
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
        if (onSuccess) onSuccess();
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
    setEditingItem(null);
    loadEventPromoters();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="mb-6">
          <EventPromoterForm 
            event={event} 
            onSuccess={handleFormSuccess}
            editingItem={editingItem}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => {
              setShowForm(false);
              setEditingItem(null);
            }}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => {
          setShowForm(true);
          setEditingItem(null);
        }}>
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
                  <TableHead>Valor Diária</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Valor Total</TableHead>
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
                    <TableCell>{item.days}</TableCell>
                    <TableCell>{formatCurrency(item.total_fee)}</TableCell>
                    <TableCell>
                      <div className="capitalize">{item.status}</div>
                    </TableCell>
                    <TableCell>{item.notes}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.total_fee)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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