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
import { useNavigate } from "react-router-dom";
import { Event } from "@/api/mongodb";
import { toast } from "react-toastify";

const QR_CODE_API_URL = "https://api.qr-code-generator.com/v1/create";
const QR_CODE_API_KEY = "CO3JxMEAYGJNaSfmdav_EGI-CP8yMa8HuJNoheULlxzRQBTs8Wg8QMBQUPPFU_3c";
const DOMAIN = "d4uimmigration.com";

export default function EventForm({ initialData, onSubmit, onCancel }) {
  const navigate = useNavigate();
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
    manager: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    notes: "",
    actual_cost: 0,
    department_id: "",
    team_members: [],
    materials: [],
    suppliers: [],
    tasks: [],
    documents: [],
    created_at: new Date(),
    updated_at: new Date(),
  });
  const [eventTypes, setEventTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    setIsLoading(true);
    try {
      const types = await EventType.list();
      // Filtra os tipos ativos no lado do cliente
      const activeTypes = types.filter(type => type.is_active);
      setEventTypes(activeTypes);
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

  const generateUTM = () => {
    const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = formData;
    const params = new URLSearchParams();
    
    if (utm_source) params.append('utm_source', utm_source);
    if (utm_medium) params.append('utm_medium', utm_medium);
    if (utm_campaign) params.append('utm_campaign', utm_campaign);
    if (utm_term) params.append('utm_term', utm_term);
    if (utm_content) params.append('utm_content', utm_content);
    
    return `https://${DOMAIN}?${params.toString()}`;
  };

  const generateQRCode = async () => {
    try {
      const utmUrl = generateUTM();
      const response = await fetch(QR_CODE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QR_CODE_API_KEY}`
        },
        body: JSON.stringify({
          frame_name: "no-frame",
          qr_code_text: utmUrl,
          image_format: "SVG"   
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code');
      }

      const qrCodeData = await response.text();
      setQrCode(qrCodeData);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  useEffect(() => {
    if (formData.utm_source || formData.utm_medium || formData.utm_campaign) {
      generateQRCode();
    }
  }, [formData.utm_source, formData.utm_medium, formData.utm_campaign, formData.utm_term, formData.utm_content]);

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
                onValueChange={value => set