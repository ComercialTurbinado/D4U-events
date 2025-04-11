import Suppliers from "./pages/Suppliers";
import Promoters from "./pages/Promoters";
import Influencers from "./pages/Influencers";

export const routes = [
  {
    path: "/suppliers",
    element: <Suppliers />,
  },
  {
    path: "/promoters",
    element: <Promoters />,
  },
  {
    path: "/influencers",
    element: <Influencers />,
  },
]; 