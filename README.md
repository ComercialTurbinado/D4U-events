# D4U Events

Sistema de gerenciamento de eventos desenvolvido com React, Vite e MongoDB.

## 🚀 Tecnologias

- React
- Vite
- TailwindCSS
- MongoDB
- Mongoose

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ComercialTurbinado/D4U-events.git
cd D4U-events
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
MONGODB_URI=sua_uri_do_mongodb
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🏗️ Estrutura do Projeto

```
src/
├── api/           # Configurações e integrações com o MongoDB
├── components/    # Componentes React reutilizáveis
├── hooks/         # Custom hooks
├── lib/           # Bibliotecas e utilitários
├── pages/         # Páginas da aplicação
└── utils/         # Funções utilitárias
```

## 📱 Funcionalidades

- Gerenciamento de Eventos
- Gerenciamento de Tarefas
- Gerenciamento de Materiais
- Gerenciamento de Fornecedores
- Gerenciamento de Departamentos
- Configurações do Sistema
- Tema Claro/Escuro
- Interface Responsiva

## 🔒 Segurança

- Proteção de rotas
- Validação de dados com Zod

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run lint`: Executa a verificação de linting
- `npm run preview`: Visualiza a build de produção localmente

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.