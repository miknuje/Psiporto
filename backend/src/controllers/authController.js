const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

// Função para fazer login
exports.login = async (req, res) => {
    const { Email, Password } = req.body;
  
    // Verifica se Email e Password foram fornecidos
    if (!Email || !Password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }
  
    try {
      // Remove espaços em branco do e-mail e da senha
      const trimmedEmail = Email.trim();
      const trimmedPassword = Password.trim();
  
      // Verifica se o usuário existe
      const user = await User.findByEmail(trimmedEmail);
      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
  
      // Valida a senha
      const isValidPassword = await User.validatePassword(trimmedEmail, trimmedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
  
      // Gera um token JWT
      const token = jwt.sign(
        { _id: user._id.toString(), Email: user.Email, Cargo: user.Cargo },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

  
      // Retorna o token e informações do usuário (sem a senha)
      res.json({
        token,
        user: {
          _id: user._id,
          Email: user.Email,
          Nome: user.Nome, // Adicione outros campos do usuário, se necessário
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Função para recuperação de senha
exports.forgotPassword = async (req, res) => {
  const { Email } = req.body;

  try {
    // Gera um token de redefinição de senha
    const resetToken = await User.generatePasswordResetToken(Email);

    // Aqui você pode enviar o token por e-mail (simulação)
    console.log(`Token de redefinição de senha para ${Email}: ${resetToken}`);

    res.json({ message: "Token de redefinição de senha enviado por e-mail", resetToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Função para redefinir a senha
exports.resetPassword = async (req, res) => {
  const { Email, token, newPassword } = req.body;

  try {
    // Redefine a senha do usuário
    await User.resetPassword(Email, token, newPassword);
    res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findByIdChange(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verifica se a senha atual foi fornecida
    if (!currentPassword) {
      return res.status(400).json({ error: "Senha atual é obrigatória" });
    }

    // Verifica se o hash da senha armazenada existe
    if (!user.Password) {
      return res.status(500).json({ error: "Erro interno: Hash da senha não encontrado" });
    }

    // Compara a senha atual com o hash armazenado
    const isValidPassword = await bcrypt.compare(currentPassword, user.Password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    // Gera o hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha do usuário
    await User.findByIdAndUpdate(userId, { Password: hashedPassword });

    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  exports.getUserInfo = async (req, res) => {
    try {
      // Buscar o usuário pelo ID armazenado no token
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      res.json({
        _id: user._id,
        Nome: user.Nome,
        Email: user.Email,
        Cargo: user.Cargo,
      });
    } catch (err) {
      res.status(500).json({ error: "Erro ao obter informações do usuário" });
    }
  };
  