import React, { useState } from "react";
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
import { Edit, Trash2, DollarSign, UserPlus } from "lucide-react";
import EventPromoterForm from "./EventPromoterForm";
import { EventPromoter } from "@/api/entities";

export default function EventPromoterTab({ eventId, promoters, onPromotersChange }) {
  const [showForm, setShowForm] = useState(false);
  const [editPromoter, setEditPromoter] = useState(null);

  const handleAddPromoter = async (promoterData) => {
    try {
      await EventPromoter.create(promoterData);
      const updatedPromoters = await EventPromoter.list({ event_id: eventId });
      onPromotersChange(updatedPromoters);
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao adicionar promotor:", error);
    }
  };

  const handleUpdatePromoter = async (id, promoterData) => {
    try {
      await EventPromoter.update(id, promoterData);
      const updatedPromoters = await EventPromoter.list({ event_id: eventId });
      onPromotersChange(updatedPromoters);
      setEditPromoter(null);
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao atualizar promotor:", error);
    }
  };

  const handleDeletePromoter = async (id) => {
    try {
      await EventPromoter.delete(id);
      const updatedPromoters = await EventPromoter.list({ event_id: eventId });
      onPromotersChange(updatedPromoters);
    } catch (error) {
      console.error("Erro ao excluir promotor:", error);
    }
  };

  const handleEdit = (promoter) => {
    setEditPromoter(promoter);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditPromoter(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Promotores do Evento</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Promotor
          </Button>
        )}
      </div>

      {showForm ? (
        <EventPromoterForm
          eventId={eventId}
          onSubmit={editPromoter ? handleUpdatePromoter : handleAddPromoter}
          onCancel={handleCancelForm}
        />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promotor</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoters.map((promoter) => (
                <TableRow key={promoter.id}>
                  <TableCell className="font-medium">{promoter.name}</TableCell>
                  <TableCell>{promoter.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {promoter.unit_cost?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {promoter.total_cost?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell>{promoter.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(promoter)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePromoter(promoter.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {promoters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum promotor adicionado ao evento
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 