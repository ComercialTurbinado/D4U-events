require('dotenv').config();
const { connectToDatabase, models } = require('./mongodb');
const { createTeamMember, findTeamMemberByEmail } = require('./team-member');

async function testConnection() {
  try {
    console.log('🔄 Iniciando teste de conexão...');
    
    // Verificar se a URL do MongoDB está definida
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não está definida no arquivo .env');
    }
    
    console.log('📡 URL do MongoDB:', process.env.MONGODB_URI);
    
    // Conectar ao banco de dados
    await connectToDatabase();
    console.log('✅ Conexão com MongoDB estabelecida com sucesso!');

    // Testar criação de usuário admin
    console.log('\n🔄 Testando criação de usuário admin...');
    const adminData = {
      name: "Administrador",
      email: "admin@d4uimmigration.com",
      password: "D4U!@dmin",
      role: "admin",
      position: "Administrador do Sistema",
      is_active: true
    };

    const existingAdmin = await findTeamMemberByEmail(adminData.email);
    if (!existingAdmin) {
      const admin = await createTeamMember(adminData);
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('ID:', admin._id);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
    } else {
      console.log('ℹ️ Usuário admin já existe');
    }

    // Testar listagem de coleções
    console.log('\n🔄 Testando listagem de coleções...');
    const collections = Object.keys(models);
    console.log('Coleções disponíveis:', collections);

    // Testar contagem de documentos em cada coleção
    console.log('\n🔄 Testando contagem de documentos...');
    for (const collection of collections) {
      const count = await models[collection].countDocuments();
      console.log(`${collection}: ${count} documentos`);
    }

    console.log('\n✨ Todos os testes concluídos com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

// Executar os testes
testConnection(); 