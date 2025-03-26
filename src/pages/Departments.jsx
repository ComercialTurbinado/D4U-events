import React, { useState, useEffect } from "react";
import { Department } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DepartmentForm from "../components/departments/DepartmentForm";
import DepartmentList from "../components/departments/DepartmentList";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await Department.list();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDepartment = async (departmentData) => {
    await Department.create(departmentData);
    setShowForm(false);
    loadDepartments();
  };

  const handleUpdateDepartment = async (id, departmentData) => {
    await Department.update(id, departmentData);
    setShowForm(false);
    setEditingDepartment(null);
    loadDepartments();
  };

  const handleDeleteDepartment = async (id) => {
    await Department.delete(id);
    loadDepartments();
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const toggleActive = async (department) => {
    await Department.update(department.id, {
      is_active: !department.is_active
    });
    loadDepartments();
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setores</h1>
          <p className="text-gray-500 mt-1">
            Gerencie os setores responsáveis por tarefas nos eventos
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingDepartment(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Setor
        </Button>
      </div>

      {showForm ? (
        <DepartmentForm
          initialData={editingDepartment}
          onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
          onCancel={() => {
            setShowForm(false);
            setEditingDepartment(null);
          }}
        />
      ) : (
        <DepartmentList
          departments={departments}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteDepartment}
          onToggleActive={toggleActive}
        />
      )}
    </div>
  );
}