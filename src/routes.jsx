import TeamMembers from "@/pages/departments/members";
import Departments from "@/pages/Departments";

const routes = [
  {
    path: "/departments",
    element: <Departments />,
    name: "Departamentos",
    icon: "building",
    children: [
      {
        path: "/departments/members",
        element: <TeamMembers />,
        name: "Membros da Equipe",
        icon: "users"
      }
    ]
  }
]; 