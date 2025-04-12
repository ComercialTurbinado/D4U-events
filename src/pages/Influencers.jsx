import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InfluencerOps as Influencer } from "@/api/mongodb";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Influencers() {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    try {
      setIsLoading(true);
      console.log('Carregando influencers...');
      const data = await Influencer.list();
      console.log('Dados recebidos:', data);
      setInfluencers(data || []);
    } catch (error) {
      console.error("Erro ao carregar influenciadores:", error);
      toast.error("Erro ao carregar influenciadores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este influenciador?")) {
      try {
        setIsLoading(true);
        await Influencer.delete(id);
        toast.success("Influenciador removido com sucesso");
        loadInfluencers();
      } catch (error) {
        console.error("Erro ao remover influenciador:", error);
        toast.error("Erro ao remover influenciador");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Influenciadores</h2>
        <Button onClick={() => navigate("/influencers/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Influenciador
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
              <TableHead>Rede Social</TableHead>
              <TableHead>Seguidores</TableHead>
              <TableHead>Valor Base</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.map((influencer) => (
              <TableRow key={influencer.id}>
                <TableCell className="font-medium">{influencer.name}</TableCell>
                <TableCell>{influencer.email}</TableCell>
                <TableCell>{influencer.phone}</TableCell>
                <TableCell>{influencer.social_media}</TableCell>
                <TableCell>{influencer.followers_count}</TableCell>
                <TableCell>{formatCurrency(influencer.reference_value)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/influencers/${influencer.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(influencer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {influencers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum influenciador cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 