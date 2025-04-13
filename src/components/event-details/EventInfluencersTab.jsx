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
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { EventInfluencerOps, InfluencerOps } from "@/api/mongodb";
import { formatCurrency } from "@/lib/utils";
import EventInfluencerForm from "./EventInfluencerForm";

export default function EventInfluencersTab({ event, onSuccess }) {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadEventInfluencers();
  }, [event]);

  const loadEventInfluencers = async () => {
    try {
      setIsLoading(true);
      // Busca os influenciadores associados ao evento
      const data = await fetch(
        `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/event-influencer?event_id=${event.id}`,
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

      // Processa os dados para usar a foto do influenciador quando não tiver foto específica
      const processedInfluencers = populatedInfluencers.map(item => {
        // Se não tiver image_url no item, mas tiver no influencer, usa a do influencer
        if (!item.image_url && item.influencer && item.influencer.image_url) {
          return {
            ...item, 
            image_url: item.influencer.image_url
          };
        }
        return item;
      });

      setInfluencers(processedInfluencers);
    } catch (error) {
      console.error("Erro ao carregar influenciadores do evento:", error);
      toast.error("Erro ao carregar influenciadores do evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id, totalFee) => {
    if (window.confirm("Tem certeza que deseja remover este influenciador do evento?")) {
      try {
        setIsLoading(true);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod"}/entities/event-influencer/${id}`,
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

        toast.success("Influenciador removido com sucesso");
        loadEventInfluencers();
        if (onSuccess) onSuccess();
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
    setEditingItem(null);
    loadEventInfluencers();
    if (onSuccess) onSuccess();
  };

  const openImageModal = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
    }
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="mb-6">
          <EventInfluencerForm 
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Influenciadores do Evento</h3>
          <Button onClick={() => {
            setShowForm(true);
            setEditingItem(null);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Influenciador
          </Button>
        </div>
      )}

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
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
                { influencers.length === 0 ? (
                  <TableRow className="text-center py-4 text-muted-foreground">
                    <TableCell colSpan={8}>Nenhum influenciador associado a este evento</TableCell>
                  </TableRow>
                ) : ( influencers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image_url ? (
                        <div 
                          className="h-10 w-10 rounded-full overflow-hidden cursor-pointer"
                          onClick={() => openImageModal(item.image_url)}
                        >
                          <img 
                            src={item.image_url} 
                            alt={`Foto de ${item.influencer?.name}`} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.influencer?.name}</TableCell>
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
                )))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal para visualização de imagem em tamanho maior */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div 
            className="bg-white rounded-lg p-2 max-w-3xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Foto do Influenciador</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeImageModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-60px)]">
              <img 
                src={selectedImage} 
                alt="Foto ampliada" 
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 