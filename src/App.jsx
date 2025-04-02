import './App.css'
import { Routes, Route } from "react-router-dom"
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

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="departments" element={<Departments />} />
          <Route path="departments/members" element={<TeamMembers />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="event-types" element={<EventTypes />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="task-categories" element={<TaskCategories />} />
          <Route path="materials" element={<Materials />} />
          <Route path="material-categories" element={<MaterialCategories />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="supplier-categories" element={<SupplierCategories />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App 