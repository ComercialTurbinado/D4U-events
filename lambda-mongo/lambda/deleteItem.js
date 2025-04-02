const { connectToDatabase, models } = require('./mongodb');

exports.handler = async (event) => {
  try {
    await connectToDatabase();
    
    const { collection, id } = event.pathParameters;
    const Model = models[collection];
    
    if (!Model) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Coleção inválida' })
      };
    }

    const deletedItem = await Model.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Item não encontrado' })
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Item deletado com sucesso' })
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
}; 