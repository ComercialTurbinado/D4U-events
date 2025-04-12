import React, { useState, useEffect, useMemo } from "react";
import { Event, EventTask, Supplier, Material } from "@/api/mongodb";
import { InfluencerOps, PromoterOps } from "@/api/mongodb";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Search,
  CheckCheck,
  Package,
  Briefcase,
  PlusCircle,
  Calendar,
  ChevronRight,
  ClipboardList,
  Truck,
  User,
  Users
} from "lucide-react";
import { formatDistanceToNow, format, differenceInDays, isAfter, isBefore, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventProgress, setEventProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    events: { total: 0, completed: 0 },
    tasks: { total: 0, completed: 0 },
    materials: { total: 0 },
    suppliers: { total: 0 },
    influencers: { total: 0 },
    promoters: { total: 0 }
  });
  
  useEffect(() => {
    loadEvents();
    loadStats();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Get all events
      const eventData = await Event.list("-start_date");
      console.log('Eventos carregados:', eventData);
      setEvents(eventData);
      
      // Calculate progress for each event
      const progressPromises = eventData.map(calculateEventProgress);
      await Promise.all(progressPromises);
      
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);

      // Carregar eventos
      const events = await Event.list();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedEvents = events.filter(event => {
        const eventDate = new Date(event.start_date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
      });

      // Carregar tarefas
      const tasks = await EventTask.list();
      const completedTasks = tasks.filter(task => task.status === 'completed');

      // Carregar contagens das outras entidades
      console.log('Carregando entidades...');
      const materials = await Material.list();
      const suppliers = await Supplier.list();
      const influencers = await InfluencerOps.list();
      const promoters = await PromoterOps.list();

      console.log('Dados carregados:', {
        materials,
        suppliers,
        influencers,
        promoters
      });

      setStats({
        events: {
          total: events.length,
          completed: completedEvents.length
        },
        tasks: {
          total: tasks.length,
          completed: completedTasks.length
        },
        materials: { total: materials.length },
        suppliers: { total: suppliers.length },
        influencers: { total: influencers.length },
        promoters: { total: promoters.length }
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEventProgress = async (event) => {
    try {
      // Get all tasks for this event
      const tasks = await EventTask.list();
      const eventTasks = tasks.filter(task => task.event_id === event.id);
      
      if (eventTasks.length === 0) {
        setEventProgress(prev => ({
          ...prev,
          [event.id]: { 
            completedTasks: 0,
            totalTasks: 0,
            percentage: 0 
          }
        }));
        return;
      }
      
      // Count completed tasks
      const completedTasks = eventTasks.filter(task => task.status === "completed").length;
      
      // Calculate percentage
      const percentage = Math.round((completedTasks / eventTasks.length) * 100);
      
      setEventProgress(prev => ({
        ...prev,
        [event.id]: { 
          completedTasks,
          totalTasks: eventTasks.length,
          percentage 
        }
      }));
    } catch (error) {
      console.error(`Error calculating progress for event ${event.id}:`, error);
      setEventProgress(prev => ({
        ...prev,
        [event.id]: { percentage: 0, completedTasks: 0, totalTasks: 0 }
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "planning": return "bg-amber-100 text-amber-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "planning": return "Planejamento";
      case "in_progress": return "Em Andamento";
      case "completed": return "Concluído";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const getDaysRemaining = (date) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return "Atrasado";
    if (days === 0) return "Hoje";
    return `${days} dias`;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-amber-500";
    if (percentage < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;
    
    return events.filter(event => 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      eventDate.setHours(0, 0, 0, 0);
      return (event.status === "planning" || event.status === "in_progress") && 
             (isToday(eventDate) || isAfter(eventDate, today));
    }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  }, [filteredEvents]);

  const completedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today || event.status === "completed";
    }).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }, [filteredEvents]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel de Eventos</h1>
        <p className="text-gray-500 mt-1">
          Acompanhe seus próximos eventos e suas tarefas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-600">Próximos Eventos</p>
                <p className="text-3xl font-bold mt-2">{stats.events.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="px-0 text-blue-600 mt-2"
              onClick={() => navigate(createPageUrl("Events"))}
            >
              Ver eventos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-600">Eventos Concluídos</p>
                <p className="text-3xl font-bold mt-2">{stats.events.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600">
              {((stats.events.completed / (stats.events.total || 1)) * 100).toFixed(0)}% do total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-amber-600">Total de Eventos</p>
                <p className="text-3xl font-bold mt-2">{stats.events.total}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="px-0 text-amber-600 mt-2"
              onClick={() => navigate(createPageUrl("Events"))}
            >
              Gerenciar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <Card className="bg-purple-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-purple-600">Fornecedores</p>
                <p className="text-3xl font-bold mt-2">{stats.suppliers.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="px-0 text-purple-600 mt-2"
              onClick={() => navigate(createPageUrl("Suppliers"))}
            >
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-indigo-600">Materiais</p>
                <p className="text-3xl font-bold mt-2">{stats.materials.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="px-0 text-indigo-600 mt-2"
              onClick={() => navigate(createPageUrl("Materials"))}
            >
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-pink-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-pink-600">Influenciadores</p>
                <p className="text-3xl font-bold mt-2">{stats.influencers.total}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="px-0 text-pink-600 mt-2"
              onClick={() => navigate(createPageUrl("Influencers"))}
            >
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-teal-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-teal-600">Promoters</p>
                <p className="text-3xl font-bold mt-2">{stats.promoters.total}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <Button 
              variant="link" 
              className="px-0 text-teal-600 mt-2"
              onClick={() => navigate(createPageUrl("Promoters"))}
            >
              Ver todos <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Pesquisar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="ml-auto">
          <Button 
            onClick={() => navigate(createPageUrl("Events"))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="completed">Eventos Concluídos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <Badge className={`${getStatusColor(event.status)} mb-2 w-fit`}>
                      {getStatusLabel(event.status)}
                    </Badge>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {event.location && `${event.location}, `}
                      {event.country}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Data</p>
                          <p className="text-sm">
                            {format(new Date(event.start_date), "dd/MM/yyyy", { locale: ptBR })}
                            {event.end_date && ` até ${format(new Date(event.end_date), "dd/MM/yyyy", { locale: ptBR })}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">Prazo</p>
                          <p className="text-sm font-semibold">
                            {getDaysRemaining(event.start_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Progresso</p>
                          <p className="text-sm font-semibold">
                            {eventProgress[event.id]?.percentage || 0}%
                          </p>
                        </div>
                        <Progress 
                          value={eventProgress[event.id]?.percentage || 0} 
                          className="h-2"
                          indicatorClassName={getProgressColor(eventProgress[event.id]?.percentage || 0)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(createPageUrl(`events/${event.id}`))}
                    >
                      Ver detalhes <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border">
              <CalendarDays className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum evento próximo</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm ? "Nenhum evento encontrado para a pesquisa atual." : "Você não tem eventos ativos no momento."}
              </p>
              <Button
                onClick={() => navigate(createPageUrl("Events"))}
                className="mt-6"
              >
                Criar um evento
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <Badge className="bg-green-100 text-green-800 mb-2 w-fit">
                      Concluído
                    </Badge>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {event.location && `${event.location}, `}
                      {event.country}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Data</p>
                          <p className="text-sm">
                            {format(new Date(event.start_date), "dd/MM/yyyy", { locale: ptBR })}
                            {event.end_date && ` até ${format(new Date(event.end_date), "dd/MM/yyyy", { locale: ptBR })}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Tarefas</p>
                          <p className="text-sm">
                            {eventProgress[event.id]?.completedTasks || 0} de {eventProgress[event.id]?.totalTasks || 0} concluídas
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(createPageUrl(`events/${event.id}`))}
                    >
                      Ver detalhes <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border">
              <CheckCheck className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum evento concluído</h3>
              <p className="mt-2 text-gray-500">
                Você ainda não tem eventos concluídos.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}