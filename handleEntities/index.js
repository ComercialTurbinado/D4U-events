const { connectToDatabase, models } = require('./mongodb');
const { login } = require('./auth');
const { findTeamMemberByEmail, createTeamMember } = require('./team-member');

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
          position: "Administrador do Sistema",
          is_active: true
        };

        await createTeamMember(adminData);
        console.log('✅ Usuário administrador criado automaticamente');
      }

      const result = await login(email, password);

      // Adicionar cabeçalhos CORS a todas as respostas
      const responseHeaders = corsHeaders();
      
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify(result)
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
          // Extrair parâmetros de query da URL
          const queryParams = new URLSearchParams(event.queryStringParameters || {});
          const sort = queryParams.get('sort');
          
          console.log('Parâmetros de query:', event.queryStringParameters);
          console.log('Parâmetro sort:', sort);
          
          // Construir objeto de ordenação
          let sortOptions = {};
          if (sort) {
            // Se o sort começa com -, significa ordenação decrescente
            if (sort.startsWith('-')) {
              sortOptions[sort.substring(1)] = -1;
            } else {
              sortOptions[sort] = 1;
            }
          }
          
          console.log('Opções de ordenação:', sortOptions);
          
          const items = await Model.find().sort(sortOptions);
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
        const newItem = new Model(dataPost);
        await newItem.save();
        return {
          statusCode: 201,
          headers: corsHeaders(),
          body: JSON.stringify({ ...newItem.toObject(), id: newItem._id })
        };

      case 'PUT':
        if (!id) return badRequest('ID obrigatório para update');

        let dataPut = JSON.parse(event.body);

        // Remove campos que não devem ser atualizados
        delete dataPut._id;
        delete dataPut.id;
        delete dataPut.__v;
        delete dataPut.createdAt;

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
        if (!id) return badRequest('ID obrigatório para delete');
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
    console.error('❌ Erro:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(), // Adicionar CORS até nas respostas de erro
      body: JSON.stringify({ error: error.message })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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