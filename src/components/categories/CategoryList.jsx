import React from "react";
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

export default function CategoryList({ categories, isLoading, onEdit, onDelete, onToggleActive, entityType }) {
  const getEntityTypeLabelSingular = () => {
    switch(entityType) {
      case 'task': return 'tarefa';
      case 'material': return 'material';
      case 'supplier': return 'fornecedor';
      default: return 'item';
    }
  };
  
  const getEntityTypeLabelPlural = () => {
    switch(entityType) {
      case 'task': return 'tarefas';
      case 'material': return 'materiais';
      case 'supplier': return 'fornecedores';
      default: return 'itens';
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
            <TableHead className="w-10"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div 
                  className="w-6 h-6 rounded-md"
                  style={{ backgroundColor: category.color || '#e5e7eb' }}
                />
              </TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="max-w-md truncate">
                {category.description || "-"}
              </TableCell>
              <TableCell>
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(category)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(category)}
                    title={category.is_active ? "Desativar" : "Ativar"}
                  >
                    {category.is_active ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Nenhuma categoria de {getEntityTypeLabelPlural()} cadastrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}