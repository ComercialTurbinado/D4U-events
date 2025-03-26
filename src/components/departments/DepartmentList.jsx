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

export default function DepartmentList({ departments, isLoading, onEdit, onDelete, onToggleActive }) {
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
            <TableHead>Responsável</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="font-medium">{department.name}</TableCell>
              <TableCell>{department.manager || "-"}</TableCell>
              <TableCell>{department.email || "-"}</TableCell>
              <TableCell>
                <Badge variant={department.is_active ? "default" : "secondary"}>
                  {department.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(department)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(department)}
                  >
                    {department.is_active ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(department.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {departments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Nenhum setor cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}