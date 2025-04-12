import {
  Calendar,
  CalendarDays,
  ClipboardList,
  Home,
  Package,
  ShoppingCart,
  Truck,
  Users,
  UserPlus,
  Coffee,
  User,
  Settings
} from "lucide-react";

const menuItems = [
  { href: "/", label: "Dashboard", icon: <Calendar className="h-4 w-4" /> },
  { href: "/events", label: "Eventos", icon: <CalendarDays className="h-4 w-4" /> },
  { href: "/tasks", label: "Tarefas", icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/materials", label: "Materiais", icon: <Package className="h-4 w-4" /> },
  { href: "/suppliers", label: "Fornecedores", icon: <Truck className="h-4 w-4" /> },
  { href: "/influencers", label: "Influenciadores", icon: <User className="h-4 w-4" /> },
  { href: "/promoters", label: "Promoters", icon: <Users className="h-4 w-4" /> },
  { href: "/settings", label: "Configurações", icon: <Settings className="h-4 w-4" /> }
]; 