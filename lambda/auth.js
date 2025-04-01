const { findTeamMemberByEmail } = require('./team-member');
const { createTeamMember } = require('./team-member');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'd4u-secret-key';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método não permitido' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Verifica se existe algum usuário no sistema
    const existingUser = await findTeamMemberByEmail(email);
    
    // Se não existir nenhum usuário, cria o admin automaticamente
    if (!existingUser) {
      const adminData = {
        name: "Administrador",
        email: "admin@d4uimmigration.com",
        password: "D4U!@dmin",
        role: "admin",
        position: "Administrador do Sistema",
        is_active: true
      };

      await createTeamMember(adminData);
      console.log('✅ Usuário administrador criado automaticamente');
    }

    // Busca o usuário (agora deve existir)
    const user = await findTeamMemberByEmail(email);
    
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Usuário não encontrado' })
      };
    }

    if (!user.is_active) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Usuário inativo' })
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Senha incorreta' })
      };
    }

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          position: user.position
        }
      })
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno do servidor' })
    };
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
}; 