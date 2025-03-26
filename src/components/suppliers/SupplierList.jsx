import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Archive, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierCategory } from "@/api/entities";

export default function SupplierList({ suppliers, isLoading, onEdit, onDelete, onToggleActive }) {
  const [categoriesMap, setCategoriesMap] = useState({});
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    try {
      const categories = await SupplierCategory.list();
      const categoriesObj = {};
      categories.forEach(cat => {
        categoriesObj[cat.id] = cat;
      });
      setCategoriesMap(categoriesObj);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Telefone/Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>
                {supplier.category_id ? (
                  <Badge 
                    style={{
                      backgroundColor: `${categoriesMap[supplier.category_id]?.color}20` || "#e5e7eb", 
                      color: categoriesMap[supplier.category_id]?.color || "#374151"
                    }}
                    className="border font-normal"
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: categoriesMap[supplier.category_id]?.color || "#374151" }}
                    />
                    {categoriesMap[supplier.category_id]?.name || "Carregando..."}
                  </Badge>
                ) : (
                  <Badge variant="outline">Sem tipo</Badge>
                )}
              </TableCell>
              <TableCell>{supplier.contact_person || "-"}</TableCell>
              <TableCell className="max-w-md truncate">
                {supplier.phone && <div>{supplier.phone}</div>}
                {supplier.email && <div className="text-sm text-gray-500">{supplier.email}</div>}
              </TableCell>
              <TableCell>
                <Badge variant={supplier.is_active ? "default" : "secondary"}>
                  {supplier.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(supplier)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(supplier)}
                  >
                    {supplier.is_active ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {suppliers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Nenhum fornecedor cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}