const { connectToDatabase } = require('./mongodb');
const { createTeamMember } = require('./team-member');

async function createInitialAdmin() {
  try {
    await connectToDatabase();
    
    const adminData = {
      name: "Administrador",
      email: "admin@d4uimmigration.com",
      password: "D4U!@dmin",
      role: "admin",
      position: "Administrador do Sistema",
      is_active: true
    };

    await createTeamMember(adminData);
    console.log('✅ Administrador criado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
  }
}

createInitialAdmin(); 