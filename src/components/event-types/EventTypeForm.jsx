import React, { useState, useEffect } from "react";
import { Task, Material } from "@/api/entities";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function EventTypeForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    description: "",
    country: "",
    cost: "",
    is_active: true,
    defaultTasks: [],
    defaultMaterials: []
  });

  const [availableTasks, setAvailableTasks] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, materialsData] = await Promise.all([
        Task.list(),
        Material.list()
      ]);
      
      // Filtra as tarefas e materiais ativos no lado do cliente
      const activeTasks = tasksData.filter(task => task.is_active);
      const activeMaterials = materialsData.filter(material => material.is_active);
      
      setAvailableTasks(activeTasks);
      setAvailableMaterials(activeMaterials);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      onSubmit(initialData.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      defaultTasks: [...prev.defaultTasks, {
        task_id: "",
        days_before_event: 7
      }]
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      defaultMaterials: [...prev.defaultMaterials, {
        material_id: "",
        default_quantity: 1
      }]
    }));
  };

  // Filtra as tarefas e materiais com base no termo de busca
  const filteredTasks = availableTasks.filter(task => 
    task.name.toLowerCase().includes(taskSearchTerm.toLowerCase())
  );

  const filteredMaterials = availableMaterials.filter(material => 
    material.name.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  const getCategoryLabel = (category) => {
    const categories = {
      design: "Design",
      logistics: "Logística",
      suppliers: "Fornecedores",
      media: "Mídia",
      other: "Outros"
    };
    return categories[category] || category;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Tipo de Evento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Corrida Patrocinada"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Ex: Brasil"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="cost">Custo</Label>
            <Input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))}
              placeholder="Insira o custo do evento"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva este tipo de evento..."
              className="h-24"
            />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="tasks" className="flex-1">Tarefas Padrão</TabsTrigger>
          <TabsTrigger value="materials" className="flex-1">Materiais</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Buscar tarefas..."
                  value={taskSearchTerm}
                  onChange={(e) => setTaskSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {formData.defaultTasks.map((task, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Tarefa {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          defaultTasks: prev.defaultTasks.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Selecione a Tarefa</Label>
                      <Select
                        value={task.task_id}
                        onValueChange={(value) => {
                          const newTasks = [...formData.defaultTasks];
                          newTasks[index].task_id = value;
                          setFormData(prev => ({ ...prev, defaultTasks: newTasks }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma tarefa" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredTasks.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {task.task_id && (
                        <div className="mt-2">
                          {(() => {
                            const selectedTask = availableTasks.find(t => t.id === task.task_id);
                            return selectedTask ? (
                              <div className="text-sm">
                                <Badge variant="outline" className="mr-2">
                                  {getCategoryLabel(selectedTask.category)}
                                </Badge>
                                {selectedTask.responsible_role && (
                                  <span className="text-gray-500">
                                    Responsável: {selectedTask.responsible_role}
                                  </span>
                                )}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Dias Antes do Evento</Label>
                      <Input
                        type="number"
                        value={task.days_before_event}
                        onChange={(e) => {
                          const newTasks = [...formData.defaultTasks];
                          newTasks[index].days_before_event = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, defaultTasks: newTasks }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTask}
                className="w-full"
                disabled={isLoading || availableTasks.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Tarefa
              </Button>
              {availableTasks.length === 0 && !isLoading && (
                <p className="text-amber-600 text-sm text-center mt-2">
                  Cadastre tarefas primeiro na seção de Tarefas
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Buscar materiais..."
                  value={materialSearchTerm}
                  onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {formData.defaultMaterials.map((material, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Material {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          defaultMaterials: prev.defaultMaterials.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Selecione o Material</Label>
                      <Select
                        value={material.material_id}
                        onValueChange={(value) => {
                          const newMaterials = [...formData.defaultMaterials];
                          newMaterials[index].material_id = value;
                          
                          const selectedMaterial = availableMaterials.find(m => m.id === value);
                          if (selectedMaterial && selectedMaterial.default_quantity) {
                            newMaterials[index].default_quantity = selectedMaterial.default_quantity;
                          }
                          
                          setFormData(prev => ({ ...prev, defaultMaterials: newMaterials }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um material" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredMaterials.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {material.material_id && (
                        <div className="mt-2">
                          {(() => {
                            const selectedMaterial = availableMaterials.find(m => m.id === material.material_id);
                            return selectedMaterial && selectedMaterial.notes ? (
                              <div className="text-sm text-gray-500">
                                {selectedMaterial.notes}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Quantidade Padrão</Label>
                      <Input
                        type="number"
                        min="1"
                        value={material.default_quantity}
                        onChange={(e) => {
                          const newMaterials = [...formData.defaultMaterials];
                          newMaterials[index].default_quantity = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, defaultMaterials: newMaterials }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addMaterial}
                className="w-full"
                disabled={isLoading || availableMaterials.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Material
              </Button>
              {availableMaterials.length === 0 && !isLoading && (
                <p className="text-amber-600 text-sm text-center mt-2">
                  Cadastre materiais primeiro na seção de Materiais
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Atualizar" : "Criar"} Tipo de Evento
        </Button>
      </div>
    </form>
  );
}
