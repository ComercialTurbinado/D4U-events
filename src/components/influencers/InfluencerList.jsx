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
import { Edit, Trash2, Image, DollarSign, Instagram, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InfluencerList({ influencers, isLoading, onEdit, onDelete }) {
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

  // Formatar números grandes com sufixos K, M
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Rede Social</TableHead>
            <TableHead>Seguidores</TableHead>
            <TableHead>Engajamento</TableHead>
            <TableHead>Valor de Referência</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((influencer) => (
            <TableRow key={influencer.id}>
              <TableCell>
                {influencer.image_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={influencer.image_url} 
                      alt={influencer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{influencer.name}</div>
                  {influencer.email && (
                    <div className="text-xs text-gray-500">{influencer.email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {influencer.social_media ? (
                  <Badge className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-200">
                    <Instagram className="h-3 w-3" />
                    {influencer.social_media}
                  </Badge>
                ) : (
                  <span className="text-gray-500 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {influencer.followers_count > 0 ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-3 w-3 text-gray-500" />
                    {formatNumber(influencer.followers_count)}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {influencer.engagement_rate > 0 ? (
                  <Badge className="bg-green-100 text-green-800">
                    {influencer.engagement_rate.toFixed(1)}%
                  </Badge>
                ) : (
                  <span className="text-gray-500 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {influencer.reference_value?.toLocaleString('pt-BR', {
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
                    onClick={() => onEdit(influencer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(influencer.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {influencers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Nenhum influenciador cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 