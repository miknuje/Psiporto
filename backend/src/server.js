require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { connectDB } = require("./config/db");
const areaRoutes = require("./routes/areaRoutes");
const nucleoRoutes = require("./routes/nucleoRoutes");
const unidadeRoutes = require("./routes/unidadeRoutes");
const nivelRoutes = require("./routes/nivelRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Rotas
app.use("/api/areas", areaRoutes);
app.use("/api/nucleos", nucleoRoutes);
app.use("/api/unidades", unidadeRoutes);
app.use("/api/niveis", nivelRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
