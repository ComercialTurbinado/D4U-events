import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EventList from "../components/events/EventList";
import EventForm from "../components/events/EventForm";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await Event.list("-start_date");
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    const newEvent = await Event.create(eventData);
    setShowForm(false);
    navigate(createPageUrl(`EventDetails?id=${newEvent.id}`));
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
        <EventList
          events={events}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteEvent}
          onView={handleViewEvent}
        />
      )}
    </div>
  );
}