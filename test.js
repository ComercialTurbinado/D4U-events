import mongoose from 'mongoose';

console.log('Versão do mongoose:', mongoose.version);
console.log('Tem connect?', typeof mongoose.connect);