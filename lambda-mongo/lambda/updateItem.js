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

    const data = JSON.parse(event.body);
    const updatedItem = await Model.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Item não encontrado' })
      };
    }
    
    // Transforma _id em id antes de retornar
    const transformedItem = updatedItem.toObject();
    transformedItem.id = transformedItem._id;
    delete transformedItem._id;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(transformedItem)
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
}; 