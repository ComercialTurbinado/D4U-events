import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, QrCode } from 'lucide-react';

export default function EventUTMTab({ event }) {
  const [utmParams, setUtmParams] = useState({
    source: 'evento',
    medium: 'qr_code',
    campaign: event?.name?.toLowerCase().replace(/\s+/g, '-') || '',
    content: '',
    term: ''
  });

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateUTMUrl = () => {
    const baseUrl = 'https://d4uimmigration.com';
    const params = new URLSearchParams();
    
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        params.append(`utm_${key}`, value);
      }
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.qr-code-generator.com/v1/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer CO3JxMEAYGJNaSfmdav_EGI-CP8yMa8HuJNoheULlxzRQBTs8Wg8QMBQUPPFU_3c'
        },
        body: JSON.stringify({
          frame_name: "no-frame",
          qr_code_text: generateUTMUrl(),
          image_format: "SVG"
         })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUTM = () => {
    navigator.clipboard.writeText(generateUTMUrl());
  };

  useEffect(() => {
    if (event?.name) {
      setUtmParams(prev => ({
        ...prev,
        campaign: event.name.toLowerCase().replace(/\s+/g, '-')
      }));
    }
  }, [event?.name]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">Fonte (source)</Label>
              <Input
                id="source"
                value={utmParams.source}
                onChange={(e) => setUtmParams(prev => ({ ...prev, source: e.target.value }))}
                placeholder="ex: evento"
              />
            </div>
            <div>
              <Label htmlFor="medium">Mídia (medium)</Label>
              <Input
                id="medium"
                value={utmParams.medium}
                onChange={(e) => setUtmParams(prev => ({ ...prev, medium: e.target.value }))}
                placeholder="ex: qr_code"
              />
            </div>
            <div>
              <Label htmlFor="campaign">Campanha (campaign)</Label>
              <Input
                id="campaign"
                value={utmParams.campaign}
                onChange={(e) => setUtmParams(prev => ({ ...prev, campaign: e.target.value }))}
                placeholder="Nome da campanha"
              />
            </div>
            <div>
              <Label htmlFor="content">Conteúdo (content)</Label>
              <Input
                id="content"
                value={utmParams.content}
                onChange={(e) => setUtmParams(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Conteúdo específico"
              />
            </div>
            <div>
              <Label htmlFor="term">Termo (term)</Label>
              <Input
                id="term"
                value={utmParams.term}
                onChange={(e) => setUtmParams(prev => ({ ...prev, term: e.target.value }))}
                placeholder="Termo de busca"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>URL com UTM</Label>
            <div className="flex gap-2">
              <Input
                value={generateUTMUrl()}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUTM}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={generateQRCode}
              disabled={isLoading}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {isLoading ? 'Gerando QR Code...' : 'Gerar QR Code'}
            </Button>
          </div>

          {qrCodeUrl && (
            <div className="mt-4 flex justify-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="max-w-[200px]"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 