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

    const data = JSON.parse(event.body);
    const newItem = new Model(data);
    await newItem.save();
    
    // Transforma _id em id antes de retornar
    const transformedItem = newItem.toObject();
    transformedItem.id = transformedItem._id;
    delete transformedItem._id;
    
    return {
      statusCode: 201,
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