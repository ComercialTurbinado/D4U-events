const categorias = [
  "Briefing",
  "Pesquisa",
  "Planejamento Estratégico",
  "Pauta/Reunião de Kickoff",
  "Copywriting",
  "Roteiro",
  "E-mail Marketing",
  "Postagens (Redes Sociais)",
  "Legenda e CTA",
  "Design Gráfico",
  "Motion Graphics",
  "Identidade Visual",
  "Landing Page / UX",
  "Audiovisual",
  "Gravação",
  "Edição de Vídeo",
  "Captação de Imagem",
  "Ads (Tráfego Pago)",
  "Impulsionamento",
  "Segmentação de Público",
  "Otimização de Campanha",
  "Redes Sociais",
  "Gestão de Comunidade",
  "Respostas/Interações",
  "Influencers / Parcerias",
  "Relatórios",
  "Monitoramento",
  "Teste A/B",
  "KPIs"
];

const API_URL = 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod/entities/task-categories';

const gerarCor = () => {
  const letras = '0123456789ABCDEF';
  let cor = '#';
  for (let i = 0; i < 6; i++) cor += letras[Math.floor(Math.random() * 16)];
  return cor;
};

const importarCategorias = async () => {
  for (const name of categorias) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: '',
        is_active: true,
        color: gerarCor()
      })
    });

    const data = await response.json();
    console.log(`✅ Categoria criada: ${name}`, data);
  }
};

importarCategorias();