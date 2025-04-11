import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image, Upload, DollarSign } from "lucide-react";

export default function PromoterForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    description: "",
    contact_person: "",
    phone: "",
    email: "",
    country: "Brasil",
    state: "",
    city: "",
    address: "",
    service_description: "",
    reference_value: 0,
    image_url: "",
  });

  const [imagePreview, setImagePreview] = useState(initialData?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData?.image_url) {
      setImagePreview(initialData.image_url);
    }
  }, [initialData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifica se o arquivo é uma imagem
    if (!file.type.match('image.*')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    setIsUploading(true);

    try {
      // Converte a imagem para base64
      const base64 = await convertToBase64(file);
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image_url: base64 }));
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
      alert('Ocorreu um erro ao processar a imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      onSubmit(initialData.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nome do Promotor</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: João Silva"
                required
              />
            </div>
          </div>

          {/* Campo de Upload de Imagem */}
          <div>
            <Label htmlFor="image_upload">Foto do Promotor</Label>
            <div className="flex items-start gap-4 mt-1">
              <div 
                className={`border rounded-md flex items-center justify-center bg-gray-50 w-32 h-32 overflow-hidden ${!imagePreview ? 'border-dashed' : ''}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Foto do promotor" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-10 h-10 text-gray-300" />
                )}
              </div>
              
              <div className="flex flex-col">
                <label 
                  htmlFor="image_upload" 
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Processando...' : 'Carregar foto'}
                </label>
                <input
                  id="image_upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Formatos suportados: JPEG, PNG, GIF. Tamanho máximo: 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_person">Pessoa de Contato</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={e => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="Nome do contato"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="exemplo@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="reference_value">Valor de Referência (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="reference_value"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  value={formData.reference_value}
                  onChange={e => setFormData(prev => ({ ...prev, reference_value: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Ex: Brasil"
              />
            </div>
            
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Ex: São Paulo"
              />
            </div>
            
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Ex: São Paulo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Rua, número, bairro"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Informações gerais sobre o promotor..."
              className="h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="service_description">Descrição dos Serviços</Label>
            <Textarea
              id="service_description"
              value={formData.service_description}
              onChange={e => setFormData(prev => ({ ...prev, service_description: e.target.value }))}
              placeholder="Detalhes sobre os serviços oferecidos..."
              className="h-24"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Atualizar" : "Criar"} Promotor
        </Button>
      </div>
    </form>
  );
} 