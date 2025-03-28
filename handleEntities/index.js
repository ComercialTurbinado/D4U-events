const { connectToDatabase, models } = require('./mongodb');

exports.handler = async (event) => {
  try {
    await connectToDatabase();

    const method = event.httpMethod;
    const fullPath = event.pathParameters.proxy; // suppliers, materials, tasks, etc.
    const pathParts = fullPath.split('/');
    const collection = pathParts[0];
    const id = pathParts[1] || null;

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
            body: JSON.stringify(item || { error: 'Item não encontrado' })
          };
        } else {
          const items = await Model.find();
          return {
            statusCode: 200,
            headers: corsHeaders(),
            body: JSON.stringify(items)
          };
        }

      case 'POST':
        const dataPost = JSON.parse(event.body);
        const newItem = new Model(dataPost);
        await newItem.save();
        return {
          statusCode: 201,
          headers: corsHeaders(),
          body: JSON.stringify(newItem)
        };

      case 'PUT':
        if (!id) return badRequest('ID obrigatório para update');
        const dataPut = JSON.parse(event.body);
        const updatedItem = await Model.findByIdAndUpdate(id, { ...dataPut, updatedAt: new Date() }, { new: true });
        return {
          statusCode: updatedItem ? 200 : 404,
          headers: corsHeaders(),
          body: JSON.stringify(updatedItem || { error: 'Item não encontrado' })
        };

      case 'DELETE':
        if (!id) return badRequest('ID obrigatório para delete');
        const deletedItem = await Model.findByIdAndDelete(id);
        return {
          statusCode: deletedItem ? 200 : 404,
          headers: corsHeaders(),
          body: JSON.stringify(deletedItem || { error: 'Item não encontrado' })
        };

      default:
        return {
          statusCode: 405,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Erro interno' })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
