const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: "Token expirado." });
    }
    req.user = decoded;

    const user = await User.findById(req.user._id, { projection: { Password: 0, resetToken: 0, resetTokenExpiry: 0 } });
    if (!user) {
      return res.status(403).json({ error: "Utilizador não encontrado." });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};