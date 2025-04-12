import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Package,
  Truck,
  Settings,
  Building2,
  Users,
  User,
  UserPlus
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Eventos",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "Tarefas",
    href: "/tasks",
    icon: ListTodo,
  },
  {
    title: "Materiais",
    href: "/materials",
    icon: Package,
  },
  {
    title: "Fornecedores",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Influenciadores",
    href: "/influencers",
    icon: User,
  },
  {
    title: "Promoters",
    href: "/promoters",
    icon: UserPlus,
  },
  {
    title: "Departamentos",
    href: "/departments",
    icon: Building2,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href ? "bg-accent" : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 