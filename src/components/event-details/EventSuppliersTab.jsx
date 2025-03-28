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
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);
  const [typeSuppliers, setTypeSuppliers] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, [eventId]);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      // Carregar fornecedores do evento
      const eventSuppliers = await EventSupplier.list();
      const suppliersForEvent = eventSuppliers.filter(es => es.event_id === eventId);
      setSuppliers(suppliersForEvent);

      // Carregar todos os fornecedores disponíveis
      const allSuppliers = await Supplier.list();
      setAvailableSuppliers(allSuppliers);

      // Carregar fornecedores padrão do tipo de evento
      const defaultSuppliers = await DefaultSupplier.list();
      const enrichedTypeSuppliers = defaultSuppliers
        .filter(s => s.event_type_id === eventTypeId)
        .map(s => ({
          ...s,
          supplier: allSuppliers.find(sup => sup.id === s.supplier_id)
        }));

      setTypeSuppliers(enrichedTypeSuppliers);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async (supplierData) => {
    await EventSupplier.create({
      ...supplierData,
      event_id: eventId
    });
    setShowForm(false);
    loadSuppliers();
  };

  const handleUpdateSupplier = async (id, supplierData) => {
    await EventSupplier.update(id, supplierData);
    setShowForm(false);
    setEditingSupplier(null);
    loadSuppliers();
  };

  const handleDeleteSupplier = async (id) => {
    await EventSupplier.delete(id);
    loadSuppliers();
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleImportFromEventType = async () => {
    if (!eventTypeId) return;
    
    setIsLoading(true);
    try {
      const defaultSuppliers = await DefaultSupplier.list();
      const suppliersToImport = defaultSuppliers.filter(ds => ds.event_type_id === eventTypeId);
      
      const existingSupplierIds = suppliers
        .filter(s => s.supplier_id)
        .map(s => s.supplier_id);
      
      for (const defaultSupplier of suppliersToImport) {
        if (existingSupplierIds.includes(defaultSupplier.supplier_id)) continue;
        
        const supplierDetails = await Supplier.get(defaultSupplier.supplier_id);
        
        if (!supplierDetails) continue;
        
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
      }
      
      loadSuppliers();
    } catch (error) {
      console.error("Error importing suppliers:", error);
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
              {eventTypeId && (
                <Button 
                  variant="outline" 
                  onClick={handleImportFromEventType}
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