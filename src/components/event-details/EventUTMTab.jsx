import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, QrCode, Download } from 'lucide-react';
import { EventUTM } from '@/api/entities';
import { API_URL, createHeaders } from '@/api/mongodb';

export default function EventUTMTab({ event }) {
  console.log("EventUTMTab sendo renderizado com evento:", event);

  const [utmParams, setUtmParams] = useState({
    source: 'evento',
    medium: 'qr_code',
    campaign: event?.name?.toLowerCase().replace(/\s+/g, '-') || '',
    content: '',
    term: ''
  });

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

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
    setStatus('Gerando QR Code...');
    try {
      // Usaremos nosso próprio backend como proxy para a API do QR Code Generator
      const response = await fetch(`${API_URL}/entities/generate-qrcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createHeaders()
        },
        body: JSON.stringify({
          apiKey: 'sRrX5tcL_2Wz2OzRHvMcrboclh7zUQ8I0Gj5clwKZVx8Fr3tBYrBvEgdc98ONmTA',
          frame_name: "no-frame",
          qr_code_text: generateUTMUrl(),
          image_format: "SVG"
          
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao gerar QR Code:', errorData);
        setStatus(`Erro: ${errorData.details || errorData.error || 'Erro desconhecido'}`);
        throw new Error(`Erro ao gerar QR Code: ${errorData.details || errorData.error || 'Erro desconhecido'}`);
      }

      const result = await response.json();
      setStatus('QR Code gerado com sucesso!');
      
      // Criamos uma URL de dados a partir do base64 retornado
      const dataUrl = `data:image/svg+xml;base64,${result.qrcode}`;
      setQrCodeUrl(dataUrl);

      // Salva a UTM no banco de dados
      try {
        setStatus('Salvando UTM para o evento...');
        console.log('Salvando UTM para o evento:', event.id);
        await EventUTM.create({
          event_id: event.id,
          source: utmParams.source,
          medium: utmParams.medium,
          campaign: utmParams.campaign,
          content: utmParams.content,
          term: utmParams.term,
          qr_code_url: generateUTMUrl() // Salvamos a URL em vez da imagem
        });
        console.log('UTM salva com sucesso!');
        setStatus('UTM e QR Code salvos com sucesso!');
      } catch (utmError) {
        console.error('Erro ao salvar UTM:', utmError);
        setStatus('QR Code gerado, mas houve um erro ao salvar a UTM');
      }

    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      setStatus('Erro ao gerar QR Code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUTM = () => {
    navigator.clipboard.writeText(generateUTMUrl());
    setStatus('URL copiada para a área de transferência!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${event.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStatus('QR Code baixado!');
    setTimeout(() => setStatus(''), 2000);
  };

  useEffect(() => {
    if (event?.name) {
      setUtmParams(prev => ({
        ...prev,
        campaign: event.name.toLowerCase().replace(/\s+/g, '-')
      }));
    }
    
    // Carrega a UTM existente para o evento
    if (event?.id) {
      loadExistingUTM();
    }
  }, [event?.name, event?.id]);

  const loadExistingUTM = async () => {
    try {
      console.log('Carregando UTM para o evento:', event.id);
      const utms = await EventUTM.list();
      const eventUTM = utms.find(utm => utm.event_id === event.id);
      
      if (eventUTM) {
        console.log('UTM existente encontrada:', eventUTM);
        setUtmParams({
          source: eventUTM.source || 'evento',
          medium: eventUTM.medium || 'qr_code',
          campaign: eventUTM.campaign || event?.name?.toLowerCase().replace(/\s+/g, '-') || '',
          content: eventUTM.content || '',
          term: eventUTM.term || ''
        });
        
        // Se houver um QR Code salvo, exibe-o
        if (eventUTM.qr_code_url) {
          setQrCodeUrl(eventUTM.qr_code_url);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar UTM existente:', error);
    }
  };

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

          {status && (
            <div className={`mt-2 p-2 text-sm text-center rounded-md ${status.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {status}
            </div>
          )}

          {qrCodeUrl && (
            <div className="mt-4 flex flex-col items-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="max-w-[200px] mb-3"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadQRCode}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" /> Baixar QR Code
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 