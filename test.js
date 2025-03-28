fetch('https://ugx0zohehd.execute-api.us-east-1.amazonaws.com/v1-prod/events')
  .then(response => response.json())
  .then(data => console.log('Eventos:', data))
  .catch(error => console.error('Erro:', error));