import React, { useState, useEffect } from "react";
import { PromoterOps as Promoter } from "@/api/mongodb";
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
import { toast } from "react-hot-toast";

export default function Promoters() {
  const [promoters, setPromoters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      setIsLoading(true);
      console.log('Carregando promoters...');
      const data = await Promoter.list();
      console.log('Dados recebidos:', data);
      
      // Criar um promoter de exemplo se não existir nenhum
      if (!data || data.length === 0) {
        console.log('Criando promoter de exemplo...');
        try {
          const examplePromoter = {
            name: "Carlos Promoções",
            description: "Empresa especializada em eventos",
            contact_person: "Carlos Santos",
            email: "carlos@exemplo.com",
            phone: "(11) 98888-8888",
            country: "Brasil",
            state: "SP",
            city: "São Paulo",
            address: "Av. Paulista, 1000",
            service_description: "Promoção de eventos corporativos",
            reference_value: 2500,
            is_active: true
          };
          
          await Promoter.create(examplePromoter);
          console.log('Promoter de exemplo criado com sucesso!');
          
          // Recarregar a lista
          const newData = await Promoter.list();
          setPromoters(newData || []);
        } catch (error) {
          console.error('Erro ao criar promoter de exemplo:', error);
        }
      } else {
        setPromoters(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar promoters:", error);
      toast.error("Erro ao carregar promoters");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este promoter?")) {
      try {
        setIsLoading(true);
        await Promoter.delete(id);
        toast.success("Promoter removido com sucesso");
        loadPromoters();
      } catch (error) {
        console.error("Erro ao remover promoter:", error);
        toast.error("Erro ao remover promoter");
      } finally {
        setIsLoading(false);
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

      {isLoading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Valor Base</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoters.map((promoter) => (
              <TableRow key={promoter.id}>
                <TableCell className="font-medium">{promoter.name}</TableCell>
                <TableCell>{promoter.email}</TableCell>
                <TableCell>{promoter.phone}</TableCell>
                <TableCell>{promoter.contact_person}</TableCell>
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
                <TableCell colSpan={6} className="text-center">
                  Nenhum promoter cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 