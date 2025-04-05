import React, { useState, useEffect } from "react";
import { Event, DefaultTask, DefaultMaterial, EventTask, EventMaterial, Task, Material } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import EventList from "../components/events/EventList";
import EventForm from "../components/events/EventForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await Event.list("-start_date");
      console.log('Eventos carregados:', data);
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      // Criar o evento
      const newEvent = await Event.create(eventData);
      
      // Se o evento tem um tipo, importar tarefas e materiais padrão
      if (newEvent.event_type_id) {
        await Promise.all([
          importDefaultTasks(newEvent.id, newEvent.event_type_id),
          importDefaultMaterials(newEvent.id, newEvent.event_type_id)
        ]);
      }
      
      setShowForm(false);
      navigate(createPageUrl(`events/${newEvent.id}`));
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const importDefaultTasks = async (eventId, eventTypeId) => {
    try {
      // Carregar tarefas padrão do tipo de evento
      const defaultTasks = await DefaultTask.list();
      const tasksToImport = defaultTasks.filter(dt => dt.event_type_id === eventTypeId);
      
      // Carregar todas as tarefas disponíveis
      const allTasks = await Task.list();
      
      for (const defaultTask of tasksToImport) {
        const taskDetails = allTasks.find(t => t.id === defaultTask.task_id);
        if (!taskDetails) continue;
        
        await EventTask.create({
          event_id: eventId,
          task_id: defaultTask.task_id,
          name: taskDetails.name,
          description: taskDetails.description || "",
          responsible_role: taskDetails.responsible_role || "",
          category_id: taskDetails.category_id || "",
          is_active: true,
          is_required: defaultTask.is_required || false,
          days_before_event: defaultTask.days_before_event || 0,
          status: "pending",
          due_date: null,
          notes: taskDetails.notes || "",
          priority: taskDetails.priority || "medium",
          estimated_hours: taskDetails.estimated_hours || 0,
          actual_hours: 0,
          cost: 0
        });
      }
    } catch (error) {
      console.error("Error importing default tasks:", error);
    }
  };

  const importDefaultMaterials = async (eventId, eventTypeId) => {
    try {
      // Carregar materiais padrão do tipo de evento
      const defaultMaterials = await DefaultMaterial.list();
      const materialsToImport = defaultMaterials.filter(dm => dm.event_type_id === eventTypeId);
      
      // Carregar todos os materiais disponíveis
      const allMaterials = await Material.list();
      
      for (const defaultMaterial of materialsToImport) {
        const materialDetails = allMaterials.find(m => m.id === defaultMaterial.material_id);
        if (!materialDetails) continue;
        
        await EventMaterial.create({
          event_id: eventId,
          material_id: defaultMaterial.material_id,
          name: materialDetails.name,
          description: materialDetails.description || "",
          quantity: defaultMaterial.default_quantity || materialDetails.default_quantity || 1,
          unit: materialDetails.unit || "un",
          status: "pending",
          notes: materialDetails.notes || "",
          unit_cost: materialDetails.initial_purchase_cost 
            ? materialDetails.initial_purchase_cost / (materialDetails.initial_purchase_quantity || 1) 
            : 0,
          total_cost: 0,
          supplier_id: materialDetails.supplier_id || "",
          category_id: materialDetails.category_id || "",
          priority: materialDetails.priority || "medium",
          delivery_date: null
        });
      }
    } catch (error) {
      console.error("Error importing default materials:", error);
    }
  };

  const handleUpdateEvent = async (id, eventData) => {
    await Event.update(id, eventData);
    setShowForm(false);
    setEditingEvent(null);
    loadEvents();
  };

  const handleDeleteEvent = async (id) => {
    await Event.delete(id);
    loadEvents();
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleViewEvent = (eventId) => {
    navigate(createPageUrl(`events/${eventId}`));
  };

  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === "active") {
      return events.filter(event => {
        const eventDate = new Date(event.start_date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today || event.status === "in_progress";
      });
    } else {
      return events.filter(event => {
        const eventDate = new Date(event.start_date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today && event.status !== "in_progress";
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-500 mt-1">
            Gerencie todos os seus eventos
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {showForm ? (
        <EventForm
          initialData={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      ) : (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">Eventos Ativos</TabsTrigger>
              <TabsTrigger value="completed">Eventos Concluídos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <EventList
                events={getFilteredEvents()}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteEvent}
                onView={handleViewEvent}
              />
            </TabsContent>
            
            <TabsContent value="completed">
              <EventList
                events={getFilteredEvents()}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteEvent}
                onView={handleViewEvent}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}