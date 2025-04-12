import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PromoterOps as Promoter } from "@/api/mongodb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PromoterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_person: "",
    phone: "",
    email: "",
    country: "",
    state: "",
    city: "",
    address: "",
    service_description: "",
    reference_value: "",
    image_url: "",
    is_active: true
  });

  useEffect(() => {
    if (id) {
      loadPromoter();
    }
  }, [id]);

  const loadPromoter = async () => {
    try {
      setIsLoading(true);
      const data = await Promoter.get(id);
      setFormData(data);
    } catch (error) {
      console.error("Erro ao carregar promoter:", error);
      toast.error("Erro ao carregar promoter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await Promoter.update(id, formData);
        toast.success("Promoter atualizado com sucesso!");
      } else {
        await Promoter.create(formData);
        toast.success("Promoter criado com sucesso!");
      }
      navigate("/promoters");
    } catch (error) {
      console.error("Erro ao salvar promoter:", error);
      toast.error("Erro ao salvar promoter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/promoters")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {id ? "Editar" : "Novo"} Promoter
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Pessoa de Contato</Label>
            <Input
              id="contact_person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_value">Valor de Referência</Label>
            <Input
              id="reference_value"
              name="reference_value"
              type="number"
              step="0.01"
              value={formData.reference_value}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_description">Descrição do Serviço</Label>
          <Textarea
            id="service_description"
            name="service_description"
            value={formData.service_description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/promoters")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
} 