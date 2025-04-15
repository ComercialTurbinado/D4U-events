import React, { useState, useEffect } from "react";
import { EventSupplier, Supplier, DefaultSupplier } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import EventSupplierForm from "./EventSupplierForm";

export default function EventSuppliersTab({ eventId, eventTypeId, onSuccess }) {
  console.log('EventSuppliersTab - Props recebidas:', { eventId, eventTypeId });
  
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);
  const [typeSuppliers, setTypeSuppliers] = useState([]);

  useEffect(() => {
    console.log('EventSuppliersTab - useEffect disparado com eventId:', eventId);
    if (eventId) {
      loadSuppliers();
    }
  }, [eventId]);

  const loadSuppliers = async () => {
    if (!eventId) {
      console.log('EventSuppliersTab - eventId não disponível, retornando...');
      return;
    }
    
    setIsLoading(true);
    setIsLoadingSuppliers(true);
    try {
      // Carregar fornecedores do evento
      console.log('EventSuppliersTab - Iniciando carregamento de fornecedores...');
      const eventSuppliers = await EventSupplier.list();
      console.log('EventSuppliersTab - Fornecedores do evento:', eventSuppliers);
      const suppliersForEvent = eventSuppliers.filter(es => {
        console.log('EventSuppliersTab - Comparando:', es.event_id, eventId);
        return es.event_id === eventId;
      });
      console.log('EventSuppliersTab - Fornecedores filtrados:', suppliersForEvent);
      setSuppliers(suppliersForEvent);

      // Carregar todos os fornecedores disponíveis
      const allSuppliers = await Supplier.list();
      console.log('EventSuppliersTab - Todos os fornecedores:', allSuppliers);
      setAvailableSuppliers(allSuppliers);

      // Carregar fornecedores padrão do tipo de evento
      if (eventTypeId) {
        console.log('EventSuppliersTab - Carregando fornecedores do tipo:', eventTypeId);
        try {
          const defaultSuppliers = await DefaultSupplier.list();
          console.log('EventSuppliersTab - Fornecedores padrão:', defaultSuppliers);
          const enrichedTypeSuppliers = defaultSuppliers
            .filter(s => s.event_type_id === eventTypeId)
            .map(s => ({
              ...s,
              supplier: allSuppliers.find(sup => sup.id === s.supplier_id)
            }));
          console.log('EventSuppliersTab - Fornecedores do tipo enriquecidos:', enrichedTypeSuppliers);
          setTypeSuppliers(enrichedTypeSuppliers);
        } catch (error) {
          console.error('Erro ao carregar fornecedores padrão:', error);
          // Se houver erro ao carregar fornecedores padrão, continuamos com a lista vazia
          setTypeSuppliers([]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      // Em caso de erro, limpar os estados para evitar dados inconsistentes
      setSuppliers([]);
      setAvailableSuppliers([]);
      setTypeSuppliers([]);
    } finally {
      setIsLoading(false);
      setIsLoadingSuppliers(false);
    }
  };

  const handleCreateSupplier = async (supplierData) => {
    try {
      console.log('EventSuppliersTab - Criando fornecedor, dados recebidos:', supplierData);
      
      // Dados básicos do fornecedor - formato MongoDB
      const newSupplierData = {
        event_id: eventId,
        supplier_id: supplierData.supplier_id || null,
        name: supplierData.name,
        supplier_type: supplierData.supplier_type || "other",
        contact_person: supplierData.contact_person || "",
        contact_phone: supplierData.phone || "",
        service_description: supplierData.service_description || "",
        status: "requested",
        notes: supplierData.notes || "",
        cost: supplierData.cost ? parseFloat(supplierData.cost) : 0,
        is_active: true
      };
      
      console.log('EventSuppliersTab - Dados formatados para criar fornecedor:', newSupplierData);
      const newSupplier = await EventSupplier.create(newSupplierData);
      console.log('EventSuppliersTab - Novo fornecedor criado:', newSupplier);
      
      setShowForm(false);
      await loadSuppliers();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
    }
  };

  const handleUpdateSupplier = async (id, supplierData) => {
    try {
      console.log('EventSuppliersTab - Atualizando fornecedor, dados recebidos:', { id, supplierData });
      
      // Dados básicos do fornecedor - formato MongoDB
      const updateData = {
        event_id: eventId,
        supplier_id: supplierData.supplier_id || null,
        name: supplierData.name,
        supplier_type: supplierData.supplier_type || "other",
        contact_person: supplierData.contact_person || "",
        contact_phone: supplierData.phone || "",
        service_description: supplierData.service_description || "",
        status: supplierData.status || "requested",
        notes: supplierData.notes || "",
        cost: supplierData.cost ? parseFloat(supplierData.cost) : 0,
        is_active: true
      };
      
      console.log('EventSuppliersTab - Dados formatados para atualizar fornecedor:', updateData);
      const updatedSupplier = await EventSupplier.update(id, updateData);
      console.log('EventSuppliersTab - Fornecedor atualizado:', updatedSupplier);
      
      setShowForm(false);
      setEditingSupplier(null);
      await loadSuppliers();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await EventSupplier.delete(id);
      loadSuppliers();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao deletar fornecedor:", error);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleImportFromEventType = async () => {
    if (!eventTypeId) {
      console.log('EventSuppliersTab - eventTypeId não disponível');
      return;
    }
    
    setIsLoadingSuppliers(true);
    try {
      console.log('EventSuppliersTab - Iniciando importação de fornecedores do tipo:', eventTypeId);
      
      // Carregar fornecedores padrão do tipo de evento
      const defaultSuppliers = await DefaultSupplier.list();
      console.log('EventSuppliersTab - Fornecedores padrão:', defaultSuppliers);
      
      const suppliersToImport = defaultSuppliers.filter(ds => ds.event_type_id === eventTypeId);
      console.log('EventSuppliersTab - Fornecedores filtrados para importar:', suppliersToImport);
      
      // Carregar todos os fornecedores disponíveis
      const allSuppliers = await Supplier.list();
      console.log('EventSuppliersTab - Todos os fornecedores:', allSuppliers);
      
      // Carregar fornecedores existentes do evento
      const eventSuppliers = await EventSupplier.list();
      console.log('EventSuppliersTab - Fornecedores do evento:', eventSuppliers);
      
      const existingSuppliers = eventSuppliers.filter(es => es.event_id === eventId);
      console.log('EventSuppliersTab - Fornecedores existentes filtrados:', existingSuppliers);
      
      for (const defaultSupplier of suppliersToImport) {
        try {
          console.log('EventSuppliersTab - Processando fornecedor:', defaultSupplier);
          
          // Verificar se o fornecedor já existe no evento
          const existingSupplier = existingSuppliers.find(es => es.supplier_id === defaultSupplier.supplier_id);
          console.log('EventSuppliersTab - Fornecedor existente:', existingSupplier);
          
          // Buscar detalhes do fornecedor base
          const supplierDetails = allSuppliers.find(s => s.id === defaultSupplier.supplier_id);
          if (!supplierDetails) {
            console.log('EventSuppliersTab - Fornecedor base não encontrado:', defaultSupplier.supplier_id);
            continue;
          }
          console.log('EventSuppliersTab - Detalhes do fornecedor base:', supplierDetails);
          
          // Dados básicos do fornecedor - formato MongoDB
          const supplierData = {
            event_id: eventId,
            supplier_id: defaultSupplier.supplier_id,
            name: supplierDetails.name,
            supplier_type: supplierDetails.supplier_type || "other",
            contact_person: supplierDetails.contact_person || "",
            contact_phone: supplierDetails.phone || "",
            service_description: supplierDetails.service_description || "",
            status: "requested",
            notes: supplierDetails.notes || "",
            cost: 0,
            is_active: true
          };
          
          console.log('EventSuppliersTab - Dados do fornecedor para criar/atualizar:', supplierData);
          
          if (existingSupplier) {
            // Atualizar fornecedor existente
            const updatedSupplier = await EventSupplier.update(existingSupplier.id, supplierData);
            console.log('EventSuppliersTab - Fornecedor atualizado:', updatedSupplier);
          } else {
            // Criar novo fornecedor
            const createdSupplier = await EventSupplier.create(supplierData);
            console.log('EventSuppliersTab - Novo fornecedor criado:', createdSupplier);
          }
        } catch (error) {
          console.error('EventSuppliersTab - Erro ao processar fornecedor:', defaultSupplier, error);
          // Continuar com o próximo fornecedor mesmo se houver erro
          continue;
        }
      }
      
      // Recarregar os fornecedores do evento
      await loadSuppliers();
    } catch (error) {
      console.error("EventSuppliersTab - Erro ao importar fornecedores:", error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      requested: "Solicitado",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  
  const getSupplierTypeLabel = (type) => {
    const types = {
      printing: "Gráfica",
      catering: "Buffet",
      media: "Mídia",
      structure: "Estrutura",
      logistics: "Logística",
      other: "Outros"
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-4">
      {showForm ? (
        <EventSupplierForm
          initialData={editingSupplier}
          availableSuppliers={availableSuppliers}
          onSubmit={editingSupplier ? handleUpdateSupplier : handleCreateSupplier}
          onCancel={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Fornecedores do Evento</h2>
            <div className="flex gap-2">
              {eventTypeId && typeSuppliers.length > 0 && (
                <Button
                  onClick={handleImportFromEventType}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading || isLoadingSuppliers}
                >
                  {isLoadingSuppliers ? "Importando..." : "Importar do Tipo de Evento"}
                </Button>
              )}
              <Button 
                onClick={() => {
                  setEditingSupplier(null);
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || isLoadingSuppliers}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoadingSuppliers ? "Carregando..." : "Novo Fornecedor"}
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isLoadingSuppliers ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Carregando fornecedores...
                    </TableCell>
                  </TableRow>
                ) : suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum fornecedor cadastrado para este evento
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSupplierTypeLabel(supplier.supplier_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{supplier.contact_person || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(supplier.status)}>
                          {getStatusLabel(supplier.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {supplier.cost ? `R$ ${parseFloat(supplier.cost).toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(supplier)}
                            title="Editar"
                            disabled={isLoadingSuppliers}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {supplier.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateSupplier(supplier.id, { ...supplier, status: "completed" })}
                              title="Marcar como concluído"
                              disabled={isLoadingSuppliers}
                            >
                              <CheckSquare className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            title="Excluir"
                            disabled={isLoadingSuppliers}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}