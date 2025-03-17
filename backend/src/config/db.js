const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI; // Usa a variável de ambiente

if (!uri) {
  throw new Error("A variável MONGO_URI não está definida no arquivo .env");
}

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("PsiPorto"); // Nome da base de dados
    console.log("Conectado ao MongoDB");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
  }
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };