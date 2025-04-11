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
import { Edit, Trash2, Image, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PromoterList({ promoters, isLoading, onEdit, onDelete }) {
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
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Valor de Referência</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoters.map((promoter) => (
            <TableRow key={promoter.id}>
              <TableCell>
                {promoter.image_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={promoter.image_url} 
                      alt={promoter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{promoter.name}</TableCell>
              <TableCell>
                <div>
                  {promoter.contact_person && (
                    <div className="font-medium text-sm">{promoter.contact_person}</div>
                  )}
                  {promoter.email && (
                    <div className="text-xs text-gray-500">{promoter.email}</div>
                  )}
                  {promoter.phone && (
                    <div className="text-xs text-gray-500">{promoter.phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {[promoter.city, promoter.state, promoter.country]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {promoter.reference_value?.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }) || 'R$ 0,00'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(promoter)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(promoter.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {promoters.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Nenhum promotor cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 