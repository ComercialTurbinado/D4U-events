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
import { EventInfluencer } from "@/api/entities";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import EventInfluencerForm from "./EventInfluencerForm";

export default function EventInfluencerTab({ eventId }) {
  const [influencers, setInfluencers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);

  useEffect(() => {
    loadInfluencers();
  }, [eventId]);

  const loadInfluencers = async () => {
    try {
      const data = await EventInfluencer.list({ event_id: eventId });
      setInfluencers(data);
    } catch (error) {
      console.error("Erro ao carregar influenciadores:", error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingInfluencer) {
        await EventInfluencer.update(editingInfluencer.id, formData);
      } else {
        await EventInfluencer.create(formData);
      }
      setShowForm(false);
      setEditingInfluencer(null);
      loadInfluencers();
    } catch (error) {
      console.error("Erro ao salvar influenciador:", error);
    }
  };

  const handleEdit = (influencer) => {
    setEditingInfluencer(influencer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este influenciador?")) {
      try {
        await EventInfluencer.delete(id);
        loadInfluencers();
      } catch (error) {
        console.error("Erro ao remover influenciador:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInfluencer(null);
  };

  if (showForm) {
    return (
      <EventInfluencerForm
        eventId={eventId}
        influencer={editingInfluencer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Influenciadores do Evento</h3>
        <Button onClick={() => setShowForm(true)}>
          Adicionar Influenciador
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Valor Unitário</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((influencer) => (
            <TableRow key={influencer.id}>
              <TableCell>{influencer.influencer?.name}</TableCell>
              <TableCell>{influencer.quantity}</TableCell>
              <TableCell>{formatCurrency(influencer.unit_cost)}</TableCell>
              <TableCell>{formatCurrency(influencer.total_cost)}</TableCell>
              <TableCell>{influencer.notes}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(influencer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(influencer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {influencers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Nenhum influenciador adicionado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 