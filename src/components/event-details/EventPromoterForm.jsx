import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Promoter } from "@/api/entities";
import { ComboBox } from "@/components/ui/combobox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { PromoterOps, EventPromoterOps } from "@/api/mongodb";
import { formatCurrency } from "@/lib/utils";
import { Upload, Image, X, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EventPromoterForm({ event, onSuccess, editingItem = null }) {
  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("select");
  const [formData, setFormData] = useState({
    event_id: event.id,
    promoter_id: "",
    fee: "",
    days: "1",
    total_fee: "",
    notes: "",
    status: "pending",
    image_url: ""
  });
  
  const [newPromoterData, setNewPromoterData] = useState({
    name: "",
    description: "",
    contact_person: "",
    phone: "",
    email: "",
    country: "",
    state: "",
    city: "",
    address: "",
    service_description: "",
    reference_value: "",
    image_url: ""
  });

  useEffect(() => {
    loadPromoters();
  }, []);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        event_id: event.id,
        promoter_id: editingItem.promoter_id || "",
        fee: editingItem.fee ? editingItem.fee.toString() : "",
        days: editingItem.days ? editingItem.days.toString() : "1",
        total_fee: editingItem.total_fee ? editingItem.total_fee.toString() : "",
        notes: editingItem.notes || "",
        status: editingItem.status || "pending",
        image_url: editingItem.image_url || ""
      });
      
      if (editingItem.image_url) {
        setImagePreview(editingItem.image_url);
      }
    }
  }, [editingItem, event.id]);

  useEffect(() => {
    // Atualiza o valor total quando o fee ou os dias mudam
    const feeValue = parseFloat(formData.fee) || 0;
    const daysValue = parseFloat(formData.days) || 1;
    const total = feeValue * daysValue;
    
    console.log(`Calculando total: ${feeValue} * ${daysValue} = ${total}`);
    
    setFormData(prev => ({
      ...prev,
      total_fee: total.toString()
    }));
  }, [formData.fee, formData.days]);

  const loadPromoters = async () => {
    try {
      setIsLoading(true);
      const data = await PromoterOps.list();
      setPromoters(data || []);
    } catch (error) {
      console.error("Erro ao carregar promotores:", error);
      toast.error("Erro ao carregar promotores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar tipo e tamanho
    if (!file.type.includes('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Criar uma URL para a prévia
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Converter para Base64 para enviar para a API
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (activeTab === "select") {
        setFormData(prev => ({
          ...prev,
          image_url: reader.result
        }));
      } else {
        setNewPromoterData(prev => ({
          ...prev,
          image_url: reader.result
        }));
      }
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    if (activeTab === "select") {
      setFormData(prev => ({
        ...prev,
        image_url: ""
      }));
    } else {
      setNewPromoterData(prev => ({
        ...prev,
        image_url: ""
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNewPromoterChange = (e) => {
    const { name, value } = e.target;
    setNewPromoterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Se selecionou um promotor, preenche o valor de referência
    if (name === "promoter_id") {
      const selectedPromoter = promoters.find(p => p.id === value);
      if (selectedPromoter) {
        // Preenche o valor de referência
        if (selectedPromoter.reference_value) {
          setFormData(prev => ({
            ...prev,
            fee: selectedPromoter.reference_value.toString()
          }));
          
          console.log(`Valor de referência preenchido: ${selectedPromoter.reference_value}`);
        }
        
        // Preenche a imagem com a foto do cadastro original
        if (selectedPromoter.image_url) {
          setImagePreview(selectedPromoter.image_url);
          setFormData(prev => ({
            ...prev,
            image_url: selectedPromoter.image_url
          }));
          console.log("Imagem do promotor carregada do cadastro original");
        }
      }
    }
  };
  
  const createNewPromoter = async () => {
    // Validar campos mínimos
    if (!newPromoterData.name) {
      toast.error("Nome do promoter é obrigatório");
      return false;
    }
    
    if (!newPromoterData.reference_value) {
      toast.error("Valor de referência é obrigatório");
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Criar novo promoter
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/promoters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newPromoterData,
          reference_value: parseFloat(newPromoterData.reference_value),
          is_active: true
        })
      });
      
      if (!response.ok) {
        throw new Error("Erro ao criar promoter");
      }
      
      const newPromoter = await response.json();
      toast.success("Promoter criado com sucesso!");
      
      // Atualizar lista de promoteres
      await loadPromoters();
      
      // Atualizar o formulário com o novo promoter
      setFormData(prev => ({
        ...prev,
        promoter_id: newPromoter.id,
        fee: newPromoterData.reference_value,
      }));
      
      // Manter a imagem se foi carregada
      if (newPromoterData.image_url) {
        setFormData(prev => ({
          ...prev,
          image_url: newPromoterData.image_url
        }));
      }
      
      // Mudar para a aba de seleção
      setActiveTab("select");
      
      return newPromoter.id;
    } catch (error) {
      console.error("Erro ao criar promoter:", error);
      toast.error("Erro ao criar promoter");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let promoterId = formData.promoter_id;
    
    // Se estiver na aba de criar novo, primeiro criar o promoter
    if (activeTab === "create") {
      promoterId = await createNewPromoter();
      if (!promoterId) return; // Se falhou na criação, não continua
    } else if (!formData.promoter_id) {
      toast.error("Selecione um promoter");
      return;
    }

    // Garantir que days e total_fee estejam definidos
    const days = formData.days || "1";
    const fee = formData.fee || "0";
    const total_fee = formData.total_fee || (parseFloat(fee) * parseFloat(days)).toString();

    // Criar objeto com todos os campos obrigatórios
    const dataToSend = {
      ...formData,
      promoter_id: promoterId,
      days,
      total_fee
    };

    console.log("Dados completos a serem enviados:", JSON.stringify(dataToSend, null, 2));

    setIsLoading(true);
    try {
      // Verificar se é uma edição ou uma adição
      if (editingItem) {
        console.log("Atualizando promoter no evento:", dataToSend);
        
        // Atualizar o evento-promoter
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event-promoter/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro na resposta:", errorText);
          throw new Error("Erro ao atualizar promoter no evento");
        }
        
        toast.success("Promoter atualizado com sucesso!");
        
      } else {
        // Adicionar novo promoter ao evento
        console.log("Adicionando promoter ao evento:", dataToSend);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/event-promoter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro na resposta:", errorText);
          throw new Error("Erro ao adicionar promoter ao evento");
        }
        
        toast.success("Promoter adicionado com sucesso!");
        
        // Atualizar orçamento do evento se houver fee
        if (parseFloat(total_fee) > 0) {
          try {
            // Obter o orçamento atual
            const oldBudget = parseFloat(event.budget) || 0;
            const fee = parseFloat(total_fee) || 0;
            const newBudget = oldBudget + fee;
            
            console.log(`Atualizando orçamento: ${oldBudget} + ${fee} = ${newBudget}`);
            
            // Atualizar o orçamento do evento
            const eventUpdateResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/events/${event.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                ...event,
                budget: newBudget
              })
            });
            
            if (!eventUpdateResponse.ok) {
              console.error("Erro ao atualizar orçamento do evento");
            } else {
              console.log("Orçamento atualizado com sucesso!");
            }
          } catch (budgetError) {
            console.error("Erro ao atualizar orçamento:", budgetError);
          }
        }
      }
      
      // Reset do formulário e retorno
      setFormData({
        event_id: event.id,
        promoter_id: "",
        fee: "",
        days: "1",
        total_fee: "",
        notes: "",
        status: "pending",
        image_url: ""
      });
      
      setNewPromoterData({
        name: "",
        description: "",
        contact_person: "",
        phone: "",
        email: "",
        country: "",
        state: "",
        city: "",
        address: "",
        service_description: "",
        reference_value: "",
        image_url: ""
      });
      
      setImagePreview(null);
      setActiveTab("select");
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar promoter:", error);
      toast.error(`Erro ao ${editingItem ? 'atualizar' : 'adicionar'} promoter ao evento`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingItem ? "Editar Promoter" : "Adicionar Promoter"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editingItem && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="select">Selecionar Existente</TabsTrigger>
                <TabsTrigger value="create">Criar Novo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="select" className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Coluna da foto - 1/3 da largura */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Foto do Promoter no Evento</Label>
                      <div className="flex-1">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                          className="hidden"
                        />
                        <Label 
                          htmlFor="image" 
                          className="flex items-center justify-center h-64 border-2 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          {imagePreview ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="object-cover w-full h-full rounded-md" 
                              />
                              <Button 
                                type="button"
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage();
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-gray-500">
                              <Upload className="h-8 w-8 mb-2" />
                              <span className="text-sm">Clique para adicionar foto</span>
                            </div>
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Coluna principal - 2/3 da largura */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="promoter_id">Promoter</Label>
                      <Select
                        value={formData.promoter_id}
                        onValueChange={(value) => handleSelectChange("promoter_id", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um promoter" />
                        </SelectTrigger>
                        <SelectContent>
                          {promoters.map((promoter) => (
                            <SelectItem key={promoter.id} value={promoter.id}>
                              {promoter.name} - {formatCurrency(promoter.reference_value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleSelectChange("status", value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="canceled">Cancelado</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          disabled={isLoading}
                          rows={3}
                          placeholder="Informações adicionais sobre a participação no evento"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="create" className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Coluna da foto - 1/3 da largura */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Foto do Promoter</Label>
                      <div className="flex-1">
                        <Input
                          id="new-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                          className="hidden"
                        />
                        <Label 
                          htmlFor="new-image" 
                          className="flex items-center justify-center h-64 border-2 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          {imagePreview ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="object-cover w-full h-full rounded-md" 
                              />
                              <Button 
                                type="button"
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage();
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-gray-500">
                              <Upload className="h-8 w-8 mb-2" />
                              <span className="text-sm">Clique para adicionar foto</span>
                            </div>
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Coluna principal - 2/3 da largura */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Nome do Promoter*</Label>
                      <Input
                        id="new-name"
                        name="name"
                        value={newPromoterData.name}
                        onChange={handleNewPromoterChange}
                        disabled={isLoading}
                        required
                        placeholder="Nome completo do promoter"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-contact">Contato</Label>
                        <Input
                          id="new-contact"
                          name="contact_person"
                          value={newPromoterData.contact_person}
                          onChange={handleNewPromoterChange}
                          disabled={isLoading}
                          placeholder="Nome do contato"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-phone">Telefone</Label>
                        <Input
                          id="new-phone"
                          name="phone"
                          value={newPromoterData.phone}
                          onChange={handleNewPromoterChange}
                          disabled={isLoading}
                          placeholder="Telefone para contato"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input
                          id="new-email"
                          name="email"
                          type="email"
                          value={newPromoterData.email}
                          onChange={handleNewPromoterChange}
                          disabled={isLoading}
                          placeholder="Email para contato"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-reference-value">Valor de Referência (R$)*</Label>
                        <Input
                          id="new-reference-value"
                          name="reference_value"
                          type="number"
                          step="0.01"
                          value={newPromoterData.reference_value}
                          onChange={handleNewPromoterChange}
                          disabled={isLoading}
                          required
                          placeholder="Valor de referência diário"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-service-description">Descrição do Serviço</Label>
                      <Textarea
                        id="new-service-description"
                        name="service_description"
                        value={newPromoterData.service_description}
                        onChange={handleNewPromoterChange}
                        disabled={isLoading}
                        rows={2}
                        placeholder="Descreva o serviço oferecido"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-description">Descrição</Label>
                      <Textarea
                        id="new-description"
                        name="description"
                        value={newPromoterData.description}
                        onChange={handleNewPromoterChange}
                        disabled={isLoading}
                        rows={2}
                        placeholder="Descrição geral do promoter"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee">Valor Diário (R$)</Label>
              <Input
                id="fee"
                name="fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.fee}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Ex: 1000.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Dias</Label>
              <Input
                id="days"
                name="days"
                type="number"
                min="1"
                value={formData.days}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Quantidade de dias"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_fee">Valor Total (R$)</Label>
              <Input
                id="total_fee"
                value={formData.total_fee}
                disabled={true}
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess} 
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Salvando..." : editingItem ? "Atualizar Promoter" : "Adicionar Promoter"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 