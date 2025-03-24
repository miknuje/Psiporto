require("dotenv").config(); // Carrega as variáveis de ambiente do arquivo .env
const cors = require("cors");
const express = require("express");
const { connectDB } = require("./config/db");
const areaRoutes = require("./routes/areaRoutes");
const nucleoRoutes = require("./routes/nucleoRoutes");
const unidadeRoutes = require("./routes/unidadeRoutes");
const nivelRoutes = require("./routes/nivelRoutes");
const authRoutes = require("./routes/authRoutes"); // Importe as rotas de autenticação
const diagnosticoRoutes = require("./routes/diagnosticoRoutes");
const inscricaoRoutes = require("./routes/inscricaoRoutes");
const candidatoRoutes = require("./routes/candidatoRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // Permite requisições do frontend
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); 

// Conectar ao MongoDB
connectDB();

// Rotas
app.use("/api/areas", areaRoutes);
app.use("/api/nucleos", nucleoRoutes);
app.use("/api/unidades", unidadeRoutes);
app.use("/api/niveis", nivelRoutes);
app.use("/api/auth", authRoutes); // Adicione as rotas de autenticação
app.use("/api/diagnosticos", diagnosticoRoutes);
app.use("/api/inscricoes", inscricaoRoutes);
app.use("/api/candidatos", candidatoRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});