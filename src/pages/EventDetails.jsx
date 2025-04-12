import React, { useState, useEffect } from "react";
import { Event, EventType, EventTask, EventMaterial, EventSupplier, Task, Material, Supplier } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Edit, ArrowLeft, Calendar, MapPin, DollarSign, User, Briefcase, ShoppingCart, ClipboardList, Info, Package, Truck, ListTodo, StickyNote, QrCode, Users } from "lucide-react";

import EventTasksTab from "../components/event-details/EventTasksTab";
import EventMaterialsTab from "../components/event-details/EventMaterialsTab";
import EventSuppliersTab from "../components/event-details/EventSuppliersTab";
import EventUTMTab from '@/components/event-details/EventUTMTab';
import EventInfluencerTab from '../components/event-details/EventInfluencerTab';
import EventPromoterTab from '../components/event-details/EventPromoterTab';
import EventInfluencersTab from "@/components/event-details/EventInfluencersTab";
import EventPromotersTab from "@/components/event-details/EventPromotersTab";

const tabs = [
  { id: 'details', label: 'Detalhes', icon: Info },
  { id: 'materials', label: 'Materiais', icon: Package },
  { id: 'suppliers', label: 'Fornecedores', icon: Truck },
  { id: 'tasks', label: 'Tarefas', icon: ListTodo },
  { id: 'notes', label: 'Notas', icon: StickyNote },
  { id: 'utm', label: 'UTM', icon: QrCode },
  { id: 'influencers', label: 'Influenciadores', icon: User },
  { id: 'promoters', label: 'Promoters', icon: Users }
];

export default function EventDetailsPage() {
  const { id } = useParams();
  console.log('ID do evento da URL:', id);
  
  const [event, setEvent] = useState(null);
  const [eventType, setEventType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [progress, setProgress] = useState({
    tasks: { completed: 0, total: 0, percentage: 0 },
    materials: { completed: 0, total: 0, percentage: 0 }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      console.log('Event ID no EventDetails:', id);
      loadEventData();
      calculateProgress();
    } else {
      navigate(createPageUrl("Events"));
    }
  }, [id, activeTab]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      const eventData = await Event.get(id);
      console.log('Dados do evento carregados:', eventData);
      setEvent(eventData);
      
      if (eventData?.event_type_id) {
        const eventTypeData = await EventType.get(eventData.event_type_id);
        console.log('Dados do tipo de evento:', eventTypeData);
        setEventType(eventTypeData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do evento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = async () => {
    try {
      // Calcular progresso das tarefas
      const tasks = await EventTask.list();
      const eventTasks = tasks.filter(task => task.event_id === id);
      const completedTasks = eventTasks.filter(task => task.status === "completed").length;
      const taskPercentage = eventTasks.length > 0 ? Math.round((completedTasks / eventTasks.length) * 100) : 0;
      
      // Calcular progresso dos materiais
      const materials = await EventMaterial.list();
      const eventMaterials = materials.filter(material => material.event_id === id);
      const receivedMaterials = eventMaterials.filter(material => material.status === "received").length;
      const materialPercentage = eventMaterials.length > 0 ? Math.round((receivedMaterials / eventMaterials.length) * 100) : 0;
      
      setProgress({
        tasks: {
          completed: completedTasks,
          total: eventTasks.length,
          percentage: taskPercentage
        },
        materials: {
          completed: receivedMaterials,
          total: eventMaterials.length,
          percentage: materialPercentage
        }
      });
    } catch (error) {
      console.error("Error calculating progress:", error);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      planning: "Planejamento",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status) => {
    const colors = {
      planning: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Adicionar uma função para recarregar os dados
  const refreshEventData = () => {
    loadEventData();
    calculateProgress();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-2">Evento não encontrado</h2>
            <p className="text-gray-500 mb-4">O evento que você está procurando não existe ou foi removido.</p>
            <Link to={createPageUrl("Events")}>
              <Button>Voltar para Eventos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8 flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(createPageUrl("Events"))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
        <Badge className={getStatusColor(event.status)}>
          {getStatusLabel(event.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {event.start_date && format(new Date(event.start_date), "dd/MM/yyyy")}
              {event.end_date && ` - ${format(new Date(event.end_date), "dd/MM/yyyy")}`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{event.location || "Não especificado"}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {event.budget ? `R$ ${parseFloat(event.budget).toFixed(2)}` : "Não especificado"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{event.description || "Sem descrição disponível."}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Progresso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Tarefas</span>
                <span className="text-sm font-medium">{progress.tasks.percentage}%</span>
              </div>
              <Progress 
                value={progress.tasks.percentage} 
                className="h-2" 
                indicatorClassName={getProgressColor(progress.tasks.percentage)}
              />
              <div className="mt-1 text-xs text-gray-500">
                {progress.tasks.completed} de {progress.tasks.total} tarefas concluídas
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Materiais</span>
                <span className="text-sm font-medium">{progress.materials.percentage}%</span>
              </div>
              <Progress 
                value={progress.materials.percentage} 
                className="h-2" 
                indicatorClassName={getProgressColor(progress.materials.percentage)}
              />
              <div className="mt-1 text-xs text-gray-500">
                {progress.materials.completed} de {progress.materials.total} materiais recebidos
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm font-medium text-gray-500 mb-2">Responsável</p>
              <p className="font-medium">{event.manager || "Não especificado"}</p>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-gray-500 mb-2">Tipo de Evento</p>
              <p className="font-medium">{eventType?.name || "Personalizado"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => navigate(createPageUrl(`Events?edit=${id}`))}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Evento a
        </Button>
      </div>

      <Tabs defaultValue="utm" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="influencers">Influenciadores</TabsTrigger>
          <TabsTrigger value="promoters">Promoters</TabsTrigger>
          <TabsTrigger value="utm">UTM</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <EventTasksTab eventId={id} eventTypeId={event?.event_type_id} />
        </TabsContent>
        
        <TabsContent value="materials">
          <EventMaterialsTab eventId={id} eventTypeId={event?.event_type_id} />
        </TabsContent>
        
        <TabsContent value="suppliers">
          <EventSuppliersTab eventId={id} eventTypeId={event?.event_type_id} />
        </TabsContent>
        
        <TabsContent value="notes">
          {/* Implemente a lógica para exibir a aba de notas */}
        </TabsContent>
        
        <TabsContent value="influencers">
          <EventInfluencersTab event={event} onSuccess={refreshEventData} />
        </TabsContent>

        <TabsContent value="promoters">
          <EventPromotersTab event={event} onSuccess={refreshEventData} />
        </TabsContent>
        
        <TabsContent value="utm">
          <EventUTMTab event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
}