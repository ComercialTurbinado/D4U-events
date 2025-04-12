import React, { useState, useEffect } from "react";
import { Promoter } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, Plus } from "lucide-react";

export default function Promoters() {
  const [promoters, setPromoters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      console.log('Carregando promoters...');
      const data = await Promoter.list();
      console.log('Dados recebidos:', data);
      setPromoters(data || []);
    } catch (error) {
      console.error("Erro ao carregar promoters:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este promoter?")) {
      try {
        await Promoter.delete(id);
        loadPromoters();
      } catch (error) {
        console.error("Erro ao remover promoter:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Promoters</h2>
        <Button onClick={() => navigate("/promoters/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Promoter
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Valor Base</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoters.map((promoter) => (
            <TableRow key={promoter.id}>
              <TableCell>{promoter.name}</TableCell>
              <TableCell>{promoter.email}</TableCell>
              <TableCell>{promoter.phone}</TableCell>
              <TableCell>{formatCurrency(promoter.reference_value)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/promoters/${promoter.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(promoter.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {promoters.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Nenhum promoter cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 