import './App.css'
import Layout from "@/pages/Layout"
import Dashboard from "@/pages/Dashboard"
import Events from "@/pages/Events"
import EventDetails from "@/pages/EventDetails"
import EventTypes from "@/pages/EventTypes"
import Tasks from "@/pages/Tasks"
import TaskCategories from "@/pages/TaskCategories"
import Materials from "@/pages/Materials"
import MaterialCategories from "@/pages/MaterialCategories"
import Suppliers from "@/pages/Suppliers"
import SupplierCategories from "@/pages/SupplierCategories"
import Departments from "@/pages/Departments"
import TeamMembers from "@/pages/departments/members"
import Settings from "@/pages/Settings"
import { Toaster } from "@/components/ui/toaster"
import { PrivateRoute } from "@/middleware/auth.jsx"
import LoginPage from "@/pages/login"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Influencers from "./pages/Influencers"
import Promoters from "./pages/Promoters"

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute><Layout /></PrivateRoute>,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/events", element: <Events /> },
      { path: "/events/:id", element: <EventDetails /> },
      { path: "/event-types", element: <EventTypes /> },
      { path: "/tasks", element: <Tasks /> },
      { path: "/task-categories", element: <TaskCategories /> },
      { path: "/materials", element: <Materials /> },
      { path: "/material-categories", element: <MaterialCategories /> },
      { path: "/suppliers", element: <Suppliers /> },
      { path: "/supplier-categories", element: <SupplierCategories /> },
      { path: "/departments", element: <Departments /> },
      { path: "/departments/members", element: <TeamMembers /> },
      { path: "/influencers", element: <Influencers /> },
      { path: "/influencers/new", element: <Influencers /> },
      { path: "/influencers/:id", element: <Influencers /> },
      { path: "/promoters", element: <Promoters /> },
      { path: "/promoters/new", element: <Promoters /> },
      { path: "/promoters/:id", element: <Promoters /> },
      { path: "/settings", element: <Settings /> }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />
  }
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
} 