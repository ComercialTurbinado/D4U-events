import React, { useState, useEffect } from "react";
import { EventMaterial, Material, Supplier, DefaultMaterial } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import EventMaterialForm from "./EventMaterialForm";

export default function EventMaterialsTab({ eventId, eventTypeId }) {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [materialStock, setMaterialStock] = useState({});

  useEffect(() => {
    loadMaterials();
  }, [eventId]);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const eventMaterials = await EventMaterial.list({
        populate: [
          { path: 'material_id', select: 'name description unit category current_stock track_inventory' },
          { path: 'supplier_id', select: 'name' }
        ]
      });

      const allMaterials = await Material.list();
      const materialsForThisEvent = eventMaterials.filter(em => em.event_id === eventId);

      const stockMap = {};
      allMaterials.forEach(mat => {
        stockMap[mat.id] = {
          current: mat.current_stock || 0,
          reserved: 0,
          available: mat.current_stock || 0
        };
      });

      eventMaterials.forEach(em => {
        const matId = typeof em.material_id === 'object' ? em.material_id._id : em.material_id;
        if (em.event_id !== eventId && stockMap[matId]) {
          stockMap[matId].reserved += em.quantity || 0;
        }
      });

      Object.keys(stockMap).forEach(id => {
        stockMap[id].available = stockMap[id].current - stockMap[id].reserved;
      });

      setMaterialStock(stockMap);

      const enriched = materialsForThisEvent.map(em => {
        const base = typeof em.material_id === 'object' ? em.material_id : {};
        return {
          ...em,
          name: em.name || base.name || 'Material sem nome',
          description: em.description || base.description || '',
          unit: em.unit || base.unit || 'un',
          category: em.category || base.category || 'other',
          supplier: em.supplier_id,
          total_cost: em.total_cost || ((em.unit_cost || 0) * (em.quantity || 0)),
          material_base_id: base._id || em.material_id
        };
      });

      setMaterials(enriched);
      setAvailableMaterials(allMaterials);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockInfo = (material) => {
    const id = material.material_base_id;
    const stock = materialStock[id] || {};
    const current = stock.current || 0;
    const reserved = stock.reserved || 0;
    const available = stock.available || 0;
    return { current, reserved, available };
  };

  return (
    <div className="space-y-4">
      {showForm ? (
        <EventMaterialForm
          initialData={editingMaterial}
          availableMaterials={availableMaterials}
          onSubmit={() => {
            setShowForm(false);
            setEditingMaterial(null);
            loadMaterials();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
          getStockInfo={getStockInfo}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Materiais do Evento</h2>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Material
            </Button>
          </div>

          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Total (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Nenhum material adicionado
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map(material => {
                    const stock = getStockInfo(material);
                    return (
                      <TableRow key={material.id}>
                        <TableCell>{material.name}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            Atual: <strong>{stock.current}</strong><br />
                            Reservado: <strong>{stock.reserved}</strong><br />
                            Disponível: <strong>{stock.available}</strong>
                          </span>
                        </TableCell>
                        <TableCell>{material.quantity}</TableCell>
                        <TableCell>R$ {(material.total_cost || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
