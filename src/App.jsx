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
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <PrivateRoute>
              <Layout>
                <Departments />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/departments/members"
          element={
            <PrivateRoute>
              <Layout>
                <TeamMembers />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Layout>
                <Events />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EventDetails />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/event-types"
          element={
            <PrivateRoute>
              <Layout>
                <EventTypes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <Layout>
                <Tasks />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/task-categories"
          element={
            <PrivateRoute>
              <Layout>
                <TaskCategories />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <PrivateRoute>
              <Layout>
                <Materials />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/material-categories"
          element={
            <PrivateRoute>
              <Layout>
                <MaterialCategories />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              <Layout>
                <Suppliers />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/supplier-categories"
          element={
            <PrivateRoute>
              <Layout>
                <SupplierCategories />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  )
}

export default App 