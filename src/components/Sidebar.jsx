import {
  Calendar,
  ClipboardList,
  Home,
  Package,
  ShoppingCart,
  Truck,
  Users,
  UserPlus,
  Coffee
} from "lucide-react";

const menuItems = [
  {
    title: "Fornecedores",
    icon: <Truck className="h-4 w-4" />,
    path: createPageUrl("Suppliers")
  },
  {
    title: "Promotores",
    icon: <UserPlus className="h-4 w-4" />,
    path: createPageUrl("Promoters")
  },
  {
    title: "Influenciadores",
    icon: <Coffee className="h-4 w-4" />,
    path: createPageUrl("Influencers")
  },
]; 