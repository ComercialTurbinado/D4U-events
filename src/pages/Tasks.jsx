import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import TaskForm from "../components/tasks/TaskForm";
import TaskList from "../components/tasks/TaskList";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await Task.list();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    await Task.create(taskData);
    setShowForm(false);
    loadTasks();
  };

  const handleUpdateTask = async (id, taskData) => {
    await Task.update(id, taskData);
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    await Task.delete(id);
    loadTasks();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as tarefas padrão para seus eventos
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {showForm ? (
        <TaskForm
          initialData={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      ) : (
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}