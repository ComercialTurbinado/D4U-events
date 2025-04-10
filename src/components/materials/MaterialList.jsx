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
import { Edit, Trash2, Image } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialCategory } from "@/api/entities";

export default function MaterialList({ materials, isLoading, onEdit, onDelete }) {
  const [categoriesMap, setCategoriesMap] = useState({});
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    try {
      const categories = await MaterialCategory.list();
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
            <TableHead className="w-16"></TableHead>
            <TableHead>Nome do Material</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Qtd. Padrão</TableHead>
            <TableHead>Estoque Atual</TableHead>
            <TableHead>Controle de Estoque</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id}>
              <TableCell>
                {material.image_url ? (
                  <div className="w-12 h-12 rounded-md overflow-hidden">
                    <img 
                      src={material.image_url} 
                      alt={material.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-gray-100">
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{material.name}</TableCell>
              <TableCell>
                {material.category_id ? (
                  <Badge 
                    style={{
                      backgroundColor: `${categoriesMap[material.category_id]?.color}20` || "#e5e7eb", 
                      color: categoriesMap[material.category_id]?.color || "#374151"
                    }}
                    className="border font-normal"
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: categoriesMap[material.category_id]?.color || "#374151" }}
                    />
                    {categoriesMap[material.category_id]?.name || "Carregando..."}
                  </Badge>
                ) : (
                  <Badge variant="outline">Sem categoria</Badge>
                )}
              </TableCell>
              <TableCell>{material.default_quantity}</TableCell>
              <TableCell>
                {material.track_inventory ? 
                  material.current_stock : 
                  <span className="text-gray-400">Não controlado</span>
                }
              </TableCell>
              <TableCell>
                {material.track_inventory ? 
                  <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge> : 
                  <Badge variant="outline">Inativo</Badge>
                }
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(material)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(material.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {materials.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Nenhum material cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}