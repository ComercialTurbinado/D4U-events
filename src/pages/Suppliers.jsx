import React, { useState, useEffect } from "react";
import { Supplier } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SupplierForm from "../components/suppliers/SupplierForm";
import SupplierList from "../components/suppliers/SupplierList";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await Supplier.list();
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async (supplierData) => {
    await Supplier.create(supplierData);
    setShowForm(false);
    loadSuppliers();
  };

  const handleUpdateSupplier = async (id, supplierData) => {
    await Supplier.update(id, supplierData);
    setShowForm(false);
    setEditingSupplier(null);
    loadSuppliers();
  };

  const handleDeleteSupplier = async (id) => {
    await Supplier.delete(id);
    loadSuppliers();
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const toggleActive = async (supplier) => {
    await Supplier.update(supplier.id, {
      is_active: !supplier.is_active
    });
    loadSuppliers();
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-500 mt-1">
            Gerencie os fornecedores para seus eventos
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {showForm ? (
        <SupplierForm
          initialData={editingSupplier}
          onSubmit={editingSupplier ? handleUpdateSupplier : handleCreateSupplier}
          onCancel={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
        />
      ) : (
        <SupplierList
          suppliers={suppliers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteSupplier}
          onToggleActive={toggleActive}
        />
      )}
    </div>
  );
}