const { connectToDatabase, models } = require('./mongodb');

exports.handler = async (event) => {
  try {
    await connectToDatabase();
    
    const { collection } = event.pathParameters;
    const Model = models[collection];
    
    if (!Model) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Coleção inválida' })
      };
    }

    const items = await Model.find();
    
    // Transforma _id em id para cada documento
    const transformedItems = items.map(item => {
      const doc = item.toObject();
      doc.id = doc._id;
      delete doc._id;
      return doc;
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(transformedItems)
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
}; 