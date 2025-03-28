const departamentos = [
    "Planejamento",
    "Conteúdo",
    "Design & Criativo",
    "Produção",
    "Mídia & Tráfego",
    "Social & Relacionamento",
    "Análise & Resultados"
  ];
  
  const API_URL = 'https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod/entities/departments';
  
  const importDepartamentos = async () => {
    for (const name of departamentos) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description: '', is_active: true })
      });
  
      const data = await response.json();
      console.log(`✅ Criado: ${name}`, data);
    }
  };
  
  importDepartamentos();