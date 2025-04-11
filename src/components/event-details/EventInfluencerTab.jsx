import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventInfluencer, Influencer } from "@/api/entities";
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

  const handleAddInfluencer = async (formData) => {
    try {
      await EventInfluencer.create(formData);
      await loadInfluencers();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao adicionar influenciador:", error);
    }
  };

  const handleUpdateInfluencer = async (formData) => {
    try {
      await EventInfluencer.update(editingInfluencer.id, formData);
      await loadInfluencers();
      setShowForm(false);
      setEditingInfluencer(null);
    } catch (error) {
      console.error("Erro ao atualizar influenciador:", error);
    }
  };

  const handleDeleteInfluencer = async (id) => {
    try {
      await EventInfluencer.delete(id);
      await loadInfluencers();
    } catch (error) {
      console.error("Erro ao deletar influenciador:", error);
    }
  };

  const handleEdit = (influencer) => {
    setEditingInfluencer(influencer);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    if (editingInfluencer) {
      await handleUpdateInfluencer(formData);
    } else {
      await handleAddInfluencer(formData);
    }
  };

  return (
    <div className="space-y-4">
      {showForm ? (
        <EventInfluencerForm
          eventId={eventId}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingInfluencer(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Influenciadores</h2>
            <Button onClick={() => setShowForm(true)}>Adicionar Influenciador</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell>{influencer.influencer?.name || "N/A"}</TableCell>
                  <TableCell>{influencer.quantity}</TableCell>
                  <TableCell>R$ {influencer.unit_cost.toFixed(2)}</TableCell>
                  <TableCell>R$ {influencer.total_cost.toFixed(2)}</TableCell>
                  <TableCell>{influencer.notes || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(influencer)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteInfluencer(influencer.id)}
                      >
                        Deletar
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
        </>
      )}
    </div>
  );
} 