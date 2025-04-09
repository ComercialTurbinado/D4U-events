const { connectToDatabase, models } = require('./mongodb');
const { findTeamMemberByEmail, createTeamMember } = require('./team-member');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'd4u-secret-key';

exports.handler = async (event) => {
  // Tratamento do OPTIONS para CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders()
    };
  }

  try {
    await connectToDatabase();

    const method = event.httpMethod;
    const fullPath = event.pathParameters.proxy; // suppliers, materials, tasks, etc.
    const pathParts = fullPath.split('/');
    const collection = pathParts[0];
    const id = pathParts[1] || null;

    // Tratamento especial para a rota de autenticação
    if (collection === 'auth') {
      if (method !== 'POST') {
        return {
          statusCode: 405,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Método não permitido para autenticação' })
        };
      }

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
          position: "admin",
          is_active: true
        };

        await createTeamMember(adminData);
        console.log('✅ Usuário administrador criado automaticamente');
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Admin created or already exists' })
      };
    }

    const Model = models[collection];
    if (!Model) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Coleção inválida' })
      };
    }

    switch (method) {
      case 'GET':
        if (id) {
          const item = await Model.findById(id);
          return {
            statusCode: item ? 200 : 404,
            headers: corsHeaders(),
            body: JSON.stringify(item ? { ...item.toObject(), id: item._id } : { error: 'Item não encontrado' })
          };
        } else {
          const items = await Model.find();
          const formatted = items.map(i => ({
            ...i.toObject(),
            id: i._id
          }));
          return {
            statusCode: 200,
            headers: corsHeaders(),
            body: JSON.stringify(formatted)
          };
        }

      case 'POST':
        const dataPost = JSON.parse(event.body);

        if (collection === 'teammembers' && dataPost.password) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          dataPost.password = await bcrypt.hash(dataPost.password, salt);
        }
        
        const newItem = new Model(dataPost);
        await newItem.save();
        return {
          statusCode: 201,
          headers: corsHeaders(),
          body: JSON.stringify({ ...newItem.toObject(), id: newItem._id })
        };

      case 'PUT':
        if (!id) return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'ID obrigatório para update' })
        };

        const token = event.headers.Authorization || event.headers.authorization;
        console.log('Token recebido:', token);
        
        if (!token) return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: 'Token ausente' }) };
        console.log('Headers recebidos:', event.headers);
        
        let userData;
        try {
          userData = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
            console.log('Dados do usuário decodificados:', userData);
        } catch (err) {
          console.error('Erro ao verificar token:', err);
          
          return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ error: 'Token inválido' }) };
        }

        const userPositions = Array.isArray(userData.position) ? userData.position : [userData.position];
        const isEditor = userPositions.includes('edit');
        const isAdmin = userPositions.includes('admin');
        const isReadOnly = userPositions.includes('read');

        if (!isAdmin && !isEditor) {
          if (isReadOnly && collection === 'tasks') {
            const taskToUpdate = await Model.findById(id);
            if (!taskToUpdate || String(taskToUpdate.department_id) !== String(userData.department_id)) {
              return {
                statusCode: 403,
                headers: corsHeaders(),
                body: JSON.stringify({ error: 'Permissão negada para editar esta tarefa' })
              };
            }
          } else {
            return {
              statusCode: 403,
              headers: corsHeaders(),
              body: JSON.stringify({ error: 'Permissão negada' })
            };
          }
        }

        let dataPut = JSON.parse(event.body);
        
        // Remove campos que não devem ser atualizados
        delete dataPut._id;
        delete dataPut.id;
        delete dataPut.__v;
        delete dataPut.createdAt;

         // Se for atualização de teammember com senha nova, faz hash
          if (collection === 'teammembers' && dataPut.password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            dataPut.password = await bcrypt.hash(dataPut.password, salt);
          }

        const updatedItem = await Model.findByIdAndUpdate(
          id,
          { ...dataPut, updatedAt: new Date() },
          { new: true }
        );

        return {
          statusCode: updatedItem ? 200 : 404,
          headers: corsHeaders(),
          body: JSON.stringify(
            updatedItem
              ? { ...updatedItem.toObject(), id: updatedItem._id }
              : { error: 'Item não encontrado' }
          )
        };

      case 'DELETE':
        if (!id) return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'ID obrigatório para delete' })
        };
        const deletedItem = await Model.findByIdAndDelete(id);
        return {
          statusCode: deletedItem ? 200 : 404,
          headers: corsHeaders(),
          body: JSON.stringify(deletedItem ? { ...deletedItem.toObject(), id: deletedItem._id } : { error: 'Item não encontrado' })
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Método não permitido!' })
        };
    }

  } catch (error) {
    console.error('Erro na operação:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
}

function badRequest(message) {
  return {
    statusCode: 400,
    headers: corsHeaders(),
    body: JSON.stringify({ error: message })
  };
}