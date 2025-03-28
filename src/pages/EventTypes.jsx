import React, { useState, useEffect } from "react";
import { EventType, DefaultTask, DefaultMaterial } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, CheckCircle2, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EventTypeForm from "../components/event-types/EventTypeForm";
import EventTypeList from "../components/event-types/EventTypeList";

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    const types = await EventType.list();
    setEventTypes(types);
  };

  const handleCreateType = async (typeData) => {
    try {
      // Criar o tipo de evento
      const eventType = await EventType.create({
        name: typeData.name,
        description: typeData.description,
        country: typeData.country,
        cost: typeData.cost,
        is_active: true
      });
      
      // Criar tarefas padrão
      if (typeData.defaultTasks && typeData.defaultTasks.length > 0) {
        const tasksToCreate = typeData.defaultTasks.map(task => ({
          event_type_id: eventType.id,
          task_id: task.task_id,
          days_before_event: task.days_before_event || 7,
          is_active: true
        }));
        await DefaultTask.bulkCreate(tasksToCreate);
      }

      // Criar materiais padrão
      if (typeData.defaultMaterials && typeData.defaultMaterials.length > 0) {
        const materialsToCreate = typeData.defaultMaterials.map(material => ({
          event_type_id: eventType.id,
          material_id: material.material_id,
          default_quantity: material.default_quantity || 1,
          is_active: true
        }));
        await DefaultMaterial.bulkCreate(materialsToCreate);
      }

      setShowForm(false);
      loadEventTypes();
    } catch (error) {
      console.error("Error creating event type:", error);
      alert("Erro ao criar o tipo de evento. Por favor, tente novamente.");
    }
  };

  const handleUpdateType = async (typeId, typeData) => {
    try {
      // Atualizar o tipo de evento
      await EventType.update(typeId, {
        name: typeData.name,
        description: typeData.description,
        country: typeData.country,
        cost: typeData.cost,
        is_active: typeData.is_active
      });
      
      // Carregar e excluir registros antigos
      const allTasks = await DefaultTask.list();
      const allMaterials = await DefaultMaterial.list();
      
      const oldTasks = allTasks.filter(task => task.event_type_id === typeId);
      const oldMaterials = allMaterials.filter(material => material.event_type_id === typeId);

      // Excluir registros antigos
      for (const task of oldTasks) await DefaultTask.delete(task.id);
      for (const material of oldMaterials) await DefaultMaterial.delete(material.id);

      // Criar novas tarefas padrão
      if (typeData.defaultTasks && typeData.defaultTasks.length > 0) {
        const tasksToCreate = typeData.defaultTasks.map(task => ({
          event_type_id: typeId,
          task_id: task.task_id,
          days_before_event: task.days_before_event || 7,
          is_active: true
        }));
        await DefaultTask.bulkCreate(tasksToCreate);
      }

      // Criar novos materiais padrão
      if (typeData.defaultMaterials && typeData.defaultMaterials.length > 0) {
        const materialsToCreate = typeData.defaultMaterials.map(material => ({
          event_type_id: typeId,
          material_id: material.material_id,
          default_quantity: material.default_quantity || 1,
          is_active: true
        }));
        await DefaultMaterial.bulkCreate(materialsToCreate);
      }

      setEditingType(null);
      setShowForm(false);
      loadEventTypes();
    } catch (error) {
      console.error("Error updating event type:", error);
      alert("Erro ao atualizar o tipo de evento. Por favor, tente novamente.");
    }
  };

  const handleEdit = async (eventType) => {
    try {
      // Load related data
      const allTasks = await DefaultTask.list();
      const allMaterials = await DefaultMaterial.list();
      
      const tasks = allTasks.filter(task => task.event_type_id === eventType.id);
      const materials = allMaterials.filter(material => material.event_type_id === eventType.id);

      setEditingType({
        ...eventType,
        defaultTasks: tasks,
        defaultMaterials: materials
      });
      setShowForm(true);
    } catch (error) {
      console.error("Error loading event type details:", error);
    }
  };

  const toggleArchive = async (eventType) => {
    await EventType.update(eventType.id, {
      is_active: !eventType.is_active
    });
    loadEventTypes();
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tipos de Evento</h1>
          <p className="text-gray-500 mt-1">
            Configure templates para diferentes tipos de eventos
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingType(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      {showForm ? (
        <EventTypeForm
          initialData={editingType}
          onSubmit={editingType ? handleUpdateType : handleCreateType}
          onCancel={() => {
            setShowForm(false);
            setEditingType(null);
          }}
        />
      ) : (
        <EventTypeList
          eventTypes={eventTypes}
          onEdit={handleEdit}
          onToggleArchive={toggleArchive}
        />
      )}
    </div>
  );
}