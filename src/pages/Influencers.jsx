import React, { useState, useEffect } from "react";
import { Influencer } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import InfluencerList from "@/components/influencers/InfluencerList";
import InfluencerForm from "@/components/influencers/InfluencerForm";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { useSearchParams } from "react-router-dom";

export default function Influencers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editInfluencer, setEditInfluencer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [influencerToDelete, setInfluencerToDelete] = useState(null);

  useEffect(() => {
    loadInfluencers();

    const editId = searchParams.get("edit");
    if (editId) {
      handleEdit(editId);
    }
  }, [searchParams]);

  const loadInfluencers = async () => {
    setIsLoading(true);
    try {
      const data = await Influencer.list();
      setInfluencers(data || []);
    } catch (error) {
      console.error("Erro ao carregar influenciadores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInfluencer = async (influencerData) => {
    try {
      await Influencer.create(influencerData);
      await loadInfluencers();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao criar influenciador:", error);
    }
  };

  const handleUpdateInfluencer = async (id, influencerData) => {
    try {
      await Influencer.update(id, influencerData);
      await loadInfluencers();
      setEditInfluencer(null);
      setShowForm(false);
      // Limpar o parâmetro de edição da URL
      searchParams.delete("edit");
      setSearchParams(searchParams);
    } catch (error) {
      console.error("Erro ao atualizar influenciador:", error);
    }
  };

  const handleDeleteInfluencer = async (id) => {
    try {
      await Influencer.delete(id);
      await loadInfluencers();
      setDeleteDialogOpen(false);
      setInfluencerToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir influenciador:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      if (typeof id === "object") {
        // Se for chamado diretamente com o objeto influencer
        setEditInfluencer(id);
        setShowForm(true);
        return;
      }

      // Buscar o influencer para edição se tiver apenas o ID
      const influencer = await Influencer.get(id);
      if (influencer) {
        setEditInfluencer(influencer);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Erro ao buscar influenciador para edição:", error);
    }
  };

  const handleDelete = (id) => {
    setInfluencerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCancelForm = () => {
    setEditInfluencer(null);
    setShowForm(false);
    // Limpar o parâmetro de edição da URL
    searchParams.delete("edit");
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Influenciadores</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Influenciador
          </Button>
        )}
      </div>

      {showForm ? (
        <InfluencerForm
          initialData={editInfluencer}
          onSubmit={editInfluencer ? handleUpdateInfluencer : handleCreateInfluencer}
          onCancel={handleCancelForm}
        />
      ) : (
        <InfluencerList
          influencers={influencers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => handleDeleteInfluencer(influencerToDelete)}
        title="Excluir Influenciador"
        description="Tem certeza que deseja excluir este influenciador? Esta ação não pode ser desfeita."
      />
    </div>
  );
} 