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

export default function EventSuppliersTab({ eventId, eventTypeId }) {
  console.log('EventSuppliersTab - Props recebidas:', { eventId, eventTypeId });
  
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    }
  };

  const handleCreateSupplier = async (supplierData) => {
    try {
      await EventSupplier.create({
        ...supplierData,
        event_id: eventId
      });
      setShowForm(false);
      loadSuppliers();
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
    }
  };

  const handleUpdateSupplier = async (id, supplierData) => {
    try {
      await EventSupplier.update(id, supplierData);
      setShowForm(false);
      setEditingSupplier(null);
      loadSuppliers();
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await EventSupplier.delete(id);
      loadSuppliers();
    } catch (error) {
      console.error("Erro ao deletar fornecedor:", error);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleImportFromEventType = async () => {
    if (!eventTypeId) return;
    
    setIsLoading(true);
    try {
      // Primeiro, vamos tentar carregar os fornecedores padrão
      let suppliersToImport = [];
      try {
        const defaultSuppliers = await DefaultSupplier.list();
        suppliersToImport = defaultSuppliers.filter(ds => ds.event_type_id === eventTypeId);
      } catch (error) {
        console.error('Erro ao carregar fornecedores padrão:', error);
        // Se não conseguirmos carregar os fornecedores padrão, usamos os disponíveis
        suppliersToImport = availableSuppliers.map(s => ({
          supplier_id: s.id,
          event_type_id: eventTypeId
        }));
      }
      
      const existingSupplierIds = suppliers
        .filter(s => s.supplier_id)
        .map(s => s.supplier_id);
      
      for (const defaultSupplier of suppliersToImport) {
        if (existingSupplierIds.includes(defaultSupplier.supplier_id)) continue;
        
        let supplierDetails;
        try {
          supplierDetails = await Supplier.get(defaultSupplier.supplier_id);
        } catch (error) {
          console.error('Erro ao carregar detalhes do fornecedor:', error);
          continue;
        }
        
        if (!supplierDetails) continue;
        
        try {
          await EventSupplier.create({
            event_id: eventId,
            supplier_id: defaultSupplier.supplier_id,
            name: supplierDetails.name,
            supplier_type: supplierDetails.supplier_type || "other",
            contact_person: supplierDetails.contact_person || "",
            contact_email: supplierDetails.contact_email || "",
            contact_phone: supplierDetails.contact_phone || "",
            service_description: supplierDetails.service_description || "",
            status: "requested",
            notes: supplierDetails.notes || "",
            cost: 0,
            payment_status: "pending",
            contract_status: "pending",
            delivery_date: null
          });
        } catch (error) {
          console.error('Erro ao criar fornecedor do evento:', error);
          // Continua para o próximo fornecedor mesmo se houver erro
          continue;
        }
      }
      
      loadSuppliers();
    } catch (error) {
      console.error("Erro ao importar fornecedores:", error);
    } finally {
      setIsLoading(false);
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
                  disabled={isLoading}
                >
                  Importar do Tipo de Evento
                </Button>
              )}
              <Button 
                onClick={() => {
                  setEditingSupplier(null);
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Fornecedor
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
                {isLoading ? (
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {supplier.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateSupplier(supplier.id, { ...supplier, status: "completed" })}
                              title="Marcar como concluído"
                            >
                              <CheckSquare className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            title="Excluir"
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