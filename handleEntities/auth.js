const { findTeamMemberByEmail, createTeamMember } = require('./team-member');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'd4u-secret-key';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://main.d2p3ej85wi84d5.amplifyapp.com',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Método não permitido' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    const existingUser = await findTeamMemberByEmail(email);

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

    const user = await findTeamMemberByEmail(email);

    if (!user || !user.is_active) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Usuário inválido ou inativo' })
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: corsHeaders,
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