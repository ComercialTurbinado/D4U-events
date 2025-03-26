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
import { Edit, Archive, RefreshCcw } from "lucide-react";

export default function EventTypeList({ eventTypes, onEdit, onToggleArchive }) {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">{type.name}</TableCell>
              <TableCell className="max-w-md truncate">
                {type.description}
              </TableCell>
              <TableCell>
                <Badge variant={type.is_active ? "default" : "secondary"}>
                  {type.is_active ? "Ativo" : "Arquivado"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleArchive(type)}
                  >
                    {type.is_active ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {eventTypes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                Nenhum tipo de evento cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}