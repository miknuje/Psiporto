const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
    // Remove "Bearer " do token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded; // Armazena os dados do usuário no request

    // Busca o usuário no banco de dados
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(403).json({ error: "Usuário não encontrado." });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
