import React, { useState, useEffect } from "react";
import { Promoter } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import PromoterList from "@/components/promoters/PromoterList";
import PromoterForm from "@/components/promoters/PromoterForm";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { useSearchParams } from "react-router-dom";

export default function Promoters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPromoter, setEditPromoter] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoterToDelete, setPromoterToDelete] = useState(null);

  useEffect(() => {
    loadPromoters();

    const editId = searchParams.get("edit");
    if (editId) {
      handleEdit(editId);
    }
  }, [searchParams]);

  const loadPromoters = async () => {
    setIsLoading(true);
    try {
      const data = await Promoter.list();
      setPromoters(data || []);
    } catch (error) {
      console.error("Erro ao carregar promotores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePromoter = async (promoterData) => {
    try {
      await Promoter.create(promoterData);
      await loadPromoters();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao criar promotor:", error);
    }
  };

  const handleUpdatePromoter = async (id, promoterData) => {
    try {
      await Promoter.update(id, promoterData);
      await loadPromoters();
      setEditPromoter(null);
      setShowForm(false);
      // Limpar o parâmetro de edição da URL
      searchParams.delete("edit");
      setSearchParams(searchParams);
    } catch (error) {
      console.error("Erro ao atualizar promotor:", error);
    }
  };

  const handleDeletePromoter = async (id) => {
    try {
      await Promoter.delete(id);
      await loadPromoters();
      setDeleteDialogOpen(false);
      setPromoterToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir promotor:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      if (typeof id === "object") {
        // Se for chamado diretamente com o objeto promoter
        setEditPromoter(id);
        setShowForm(true);
        return;
      }

      // Buscar o promotor para edição se tiver apenas o ID
      const promoter = await Promoter.get(id);
      if (promoter) {
        setEditPromoter(promoter);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Erro ao buscar promotor para edição:", error);
    }
  };

  const handleDelete = (id) => {
    setPromoterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCancelForm = () => {
    setEditPromoter(null);
    setShowForm(false);
    // Limpar o parâmetro de edição da URL
    searchParams.delete("edit");
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotores</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Promotor
          </Button>
        )}
      </div>

      {showForm ? (
        <PromoterForm
          initialData={editPromoter}
          onSubmit={editPromoter ? handleUpdatePromoter : handleCreatePromoter}
          onCancel={handleCancelForm}
        />
      ) : (
        <PromoterList
          promoters={promoters}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => handleDeletePromoter(promoterToDelete)}
        title="Excluir Promotor"
        description="Tem certeza que deseja excluir este promotor? Esta ação não pode ser desfeita."
      />
    </div>
  );
} 