import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  CalendarDays, 
  Tag, 
  ShoppingCart, 
  Briefcase, 
  Users, 
  Settings, 
  Layout as LayoutIcon,
  ChevronDown,
  ChevronRight,
  List,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import LogoutButton from "@/components/team/LogoutButton";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("");
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/departments", label: "Setores", icon: "🏢" },
    { path: "/teammembers", label: "Equipe", icon: "👥" },
    { path: "/events", label: "Eventos", icon: "🎉" },
    { path: "/event-types", label: "Tipos de Evento", icon: "📋" },
    { path: "/tasks", label: "Tarefas", icon: "✅" },
    { path: "/task-categories", label: "Categorias de Tarefa", icon: "📑" },
    { path: "/materials", label: "Materiais", icon: "📦" },
    { path: "/material-categories", label: "Categorias de Material", icon: "🏷️" },
    { path: "/suppliers", label: "Fornecedores", icon: "🤝" },
    { path: "/supplier-categories", label: "Categorias de Fornecedor", icon: "🏷️" },
    { path: "/settings", label: "Configurações", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold">D4U Events</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              {menuItems.map((item) => (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center p-2 hover:bg-accent rounded-md",
                      location.pathname === item.path && "bg-accent"
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
            <div className="absolute bottom-0 w-64 p-4">
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={cn(
          "transition-all duration-200 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-0"
        )}>
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex items-center justify-between h-16 px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
