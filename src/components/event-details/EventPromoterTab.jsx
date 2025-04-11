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
import { Edit, Trash2, DollarSign, UserPlus } from "lucide-react";
import EventPromoterForm from "./EventPromoterForm";
import { EventPromoter } from "@/api/entities";
import { formatCurrency } from "@/lib/utils";

export default function EventPromoterTab({ eventId }) {
  const [promoters, setPromoters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPromoter, setEditingPromoter] = useState(null);

  useEffect(() => {
    loadPromoters();
  }, [eventId]);

  const loadPromoters = async () => {
    try {
      const data = await EventPromoter.list({ event_id: eventId });
      setPromoters(data);
    } catch (error) {
      console.error("Erro ao carregar promoters:", error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingPromoter) {
        await EventPromoter.update(editingPromoter.id, formData);
      } else {
        await EventPromoter.create(formData);
      }
      setShowForm(false);
      setEditingPromoter(null);
      loadPromoters();
    } catch (error) {
      console.error("Erro ao salvar promoter:", error);
    }
  };

  const handleEdit = (promoter) => {
    setEditingPromoter(promoter);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este promoter?")) {
      try {
        await EventPromoter.delete(id);
        loadPromoters();
      } catch (error) {
        console.error("Erro ao remover promoter:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPromoter(null);
  };

  if (showForm) {
    return (
      <EventPromoterForm
        eventId={eventId}
        promoter={editingPromoter}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

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
              <TableCell className="font-medium">{promoter.promoter?.name}</TableCell>
              <TableCell>{promoter.quantity}</TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(promoter.unit_cost)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(promoter.total_cost)}
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
                    onClick={() => handleDelete(promoter.id)}
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
  );
} 