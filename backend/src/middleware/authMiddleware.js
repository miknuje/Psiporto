const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Obtém o token do cabeçalho Authorization
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token de autenticação não fornecido" });
    }

    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adiciona os dados do usuário ao objeto req

    next(); // Continua para a próxima função (controller)
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};