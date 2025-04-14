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
  Home,
  User,
  UserPlus
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
    { name: "Painel", icon: Home, path: "/" },
    { 
      name: "Eventos", 
      icon: CalendarDays, 
      path: "/events",
      submenu: [
        { name: "Listar Eventos", path: "/events" },
        { name: "Tipos de Evento", path: "/event-types" }
      ]
    },
    { 
      name: "Tarefas", 
      icon: List, 
      path: "/tasks",
      submenu: [
        { name: "Listar Tarefas", path: "/tasks" },
        { name: "Categorias", path: "/task-categories" }
      ]
    },
    { 
      name: "Materiais", 
      icon: ShoppingCart, 
      path: "/materials",
      submenu: [
        { name: "Listar Materiais", path: "/materials" },
        { name: "Categorias", path: "/material-categories" }
      ]
    },
    { 
      name: "Fornecedores", 
      icon: Briefcase, 
      path: "/suppliers",
      submenu: [
        { name: "Listar Fornecedores", path: "/suppliers" },
        { name: "Categorias", path: "/supplier-categories" }
      ]
    },
    { 
      name: "Influenciadores", 
      icon: User, 
      path: "/influencers" 
    },
    { 
      name: "Promoters", 
      icon: UserPlus, 
      path: "/promoters" 
    },
    { 
      name: "Setores", 
      icon: Users, 
      path: "/departments",
      submenu: [
        { name: "Listar setores", path: "/departments" },
        { name: "Membros da Equipe", path: "/departments/members" }
      ]
    }
    //,{ name: "Configurações", icon: Settings, path: "/settings" },
  ]; 

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold"><img src="https://iili.io/3R5bk1R.png" alt="logo" className="text-center mb-5" width="100px" /></h1>
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
              <div key={item.name}>
                {item.submenu ? (
                  <Collapsible
                    open={openSubmenu === item.name}
                    onOpenChange={(open) => setOpenSubmenu(open ? item.name : "")}
                  >
                    <CollapsibleTrigger className="flex items-center w-full p-2 hover:bg-accent rounded-md">
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.name}</span>
                      {openSubmenu === item.name ? (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={cn(
                            "flex items-center p-2 hover:bg-accent rounded-md",
                            location.pathname === subItem.path && "bg-accent"
                          )}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center p-2 hover:bg-accent rounded-md",
                      location.pathname === item.path && "bg-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
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
            <LogoutButton />
          </div>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
