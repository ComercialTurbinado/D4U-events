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
import { EventInfluencerOps, InfluencerOps } from "@/api/mongodb";
import { formatCurrency } from "@/lib/utils";
import EventInfluencerForm from "./EventInfluencerForm";

export default function EventInfluencersTab({ event, onSuccess }) {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadEventInfluencers();
  }, [event]);

  const loadEventInfluencers = async () => {
    try {
      setIsLoading(true);
      // Busca os influenciadores associados ao evento
      const data = await fetch(
        `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/event_influencers?event_id=${event.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!data.ok) {
        throw new Error("Erro ao carregar influenciadores do evento");
      }

      const eventInfluencers = await data.json();

      // Para cada influencer do evento, busca os detalhes do influencer
      const populatedInfluencers = await Promise.all(
        eventInfluencers.map(async (item) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/influencers/${item.influencer_id}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (!response.ok) {
              console.error(`Erro ao buscar detalhes do influenciador ${item.influencer_id}`);
              return { ...item, influencer: { name: "Influenciador não encontrado" } };
            }

            const influencer = await response.json();
            return { ...item, influencer };
          } catch (error) {
            console.error(`Erro ao processar influenciador ${item.influencer_id}:`, error);
            return { ...item, influencer: { name: "Erro ao carregar detalhes" } };
          }
        })
      );

      setInfluencers(populatedInfluencers);
    } catch (error) {
      console.error("Erro ao carregar influenciadores do evento:", error);
      toast.error("Erro ao carregar influenciadores do evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, fee) => {
    if (window.confirm("Tem certeza que deseja remover este influenciador do evento?")) {
      try {
        setIsLoading(true);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/event_influencers/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao remover influenciador do evento");
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

        toast.success("Influenciador removido com sucesso");
        loadEventInfluencers();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Erro ao remover influenciador:", error);
        toast.error("Erro ao remover influenciador do evento");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadEventInfluencers();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="mb-6">
          <EventInfluencerForm event={event} onSuccess={handleFormSuccess} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Influenciador
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Influenciadores do Evento</CardTitle>
          <CardDescription>Gerenciar os influenciadores associados a este evento</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : influencers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum influenciador associado a este evento
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
                {influencers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.influencer?.name}</TableCell>
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