import React, { useState, useEffect } from "react";
import { TaskCategory } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CategoryForm from "../components/categories/CategoryForm";
import CategoryList from "../components/categories/CategoryList";

export default function TaskCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await TaskCategory.list();
      setCategories(data);
    } catch (error) {
      console.error("Error loading task categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    await TaskCategory.create(categoryData);
    setShowForm(false);
    loadCategories();
  };

  const handleUpdateCategory = async (id, categoryData) => {
    await TaskCategory.update(id, categoryData);
    setShowForm(false);
    setEditingCategory(null);
    loadCategories();
  };

  const handleDeleteCategory = async (id) => {
    await TaskCategory.delete(id);
    loadCategories();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const toggleActive = async (category) => {
    await TaskCategory.update(category.id, {
      is_active: !category.is_active
    });
    loadCategories();
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias de Tarefas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as categorias disponíveis para tarefas
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {showForm ? (
        <CategoryForm
          initialData={editingCategory}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          entityType="task"
        />
      ) : (
        <CategoryList
          categories={categories}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteCategory}
          onToggleActive={toggleActive}
          entityType="task"
        />
      )}
    </div>
  );
}