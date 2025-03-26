import React, { useState, useEffect } from "react";
import { Material } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MaterialForm from "../components/materials/MaterialForm";
import MaterialList from "../components/materials/MaterialList";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const data = await Material.list();
      setMaterials(data);
    } catch (error) {
      console.error("Error loading materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMaterial = async (materialData) => {
    await Material.create(materialData);
    setShowForm(false);
    loadMaterials();
  };

  const handleUpdateMaterial = async (id, materialData) => {
    await Material.update(id, materialData);
    setShowForm(false);
    setEditingMaterial(null);
    loadMaterials();
  };

  const handleDeleteMaterial = async (id) => {
    await Material.delete(id);
    loadMaterials();
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-500 mt-1">
            Gerencie os materiais utilizados nos eventos
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingMaterial(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Material
        </Button>
      </div>

      {showForm ? (
        <MaterialForm
          initialData={editingMaterial}
          onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial}
          onCancel={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
        />
      ) : (
        <MaterialList
          materials={materials}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteMaterial}
        />
      )}
    </div>
  );
}