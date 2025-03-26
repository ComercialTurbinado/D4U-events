
import React, { useState, useEffect } from "react";
import { EventType } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

export default function EventForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    event_type_id: "",
    description: "",
    start_date: "",
    end_date: "",
    country: "",
    location: "",
    status: "planning",
    budget: "",
    manager: ""
  });
  const [eventTypes, setEventTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    setIsLoading(true);
    try {
      const types = await EventType.filter({ is_active: true });
      setEventTypes(types);
    } catch (error) {
      console.error("Error loading event types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submittedData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
    };
    
    if (initialData) {
      onSubmit(initialData.id, submittedData);
    } else {
      onSubmit(submittedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Evento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Lançamento Produto XYZ"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="event_type_id">Tipo de Evento</Label>
              <Select
                value={formData.event_type_id}
                onValueChange={value => setFormData(prev => ({ ...prev, event_type_id: value }))}
              >
                <SelectTrigger id="event_type_id">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eventTypes.length === 0 && !isLoading && (
                <p className="text-sm text-amber-600 mt-1">
                  Cadastre tipos de evento primeiro
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="start_date"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? (
                      format(new Date(formData.start_date), "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? new Date(formData.start_date) : undefined}
                    onSelect={date => setFormData(prev => ({ ...prev, start_date: date ? date.toISOString().split('T')[0] : "" }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="end_date"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? (
                      format(new Date(formData.end_date), "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date ? new Date(formData.end_date) : undefined}
                    onSelect={date => setFormData(prev => ({ ...prev, end_date: date ? date.toISOString().split('T')[0] : "" }))}
                    initialFocus
                    disabled={date => !formData.start_date || date < new Date(formData.start_date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Ex: Brasil"
              />
            </div>
            
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Centro de Convenções"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planejamento</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="Ex: 10000.00"
              />
            </div>
            
            <div>
              <Label htmlFor="manager">Responsável</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={e => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                placeholder="Ex: João Silva"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o evento..."
              className="h-24"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Atualizar" : "Criar"} Evento
        </Button>
      </div>
    </form>
  );
}
