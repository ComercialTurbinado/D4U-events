import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PromoterOps as Promoter } from "@/api/mongodb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X, User } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PromoterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Log para depuração
  console.log("Objeto Promoter:", Promoter);
  console.log("Métodos disponíveis:", Object.keys(Promoter));
  
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

  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    }
  }, [formData.image_url]);

  const loadPromoter = async () => {
    try {
      setIsLoading(true);
      const data = await Promoter.get(id);
      setFormData(data);
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    } catch (error) {
      console.error("Erro ao carregar promoter:", error);
      toast.error("Erro ao carregar promoter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar tipo e tamanho
    if (!file.type.includes('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Criar uma URL para a prévia
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Converter para Base64 para enviar para a API
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        image_url: reader.result
      }));
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image_url: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Dados do formulário:", formData);
      
      if (id) {
        await Promoter.update(id, formData);
        toast.success("Promoter atualizado com sucesso!");
      } else {
        // Implementação direta usando fetch
        console.log("Criando promoter via API direta");
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod'}/entities/promoters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao criar promoter: ${response.status}`);
        }
        
        await response.json();
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
    <div className="container mx-auto py-8 max-w-7xl"> 
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
          <Label htmlFor="image_upload">Foto do Promoter</Label>
          <div className="flex items-start gap-4 mt-1">
            <div 
              className={`border rounded-md flex items-center justify-center bg-gray-50 w-32 h-32 overflow-hidden ${!imagePreview ? 'border-dashed' : ''}`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Foto do promoter" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-300" />
              )}
            </div>
            
            <div className="flex flex-col">
              <label 
                htmlFor="image_upload" 
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Processando...' : 'Carregar foto'}
              </label>
              <input
                id="image_upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
              {imagePreview && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover foto
                </Button>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Formatos suportados: JPEG, PNG, GIF. Tamanho máximo: 5MB.
              </p>
            </div>
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => navigate("/promoters")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
} 