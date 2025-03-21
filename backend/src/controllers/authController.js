const nodemailer = require("nodemailer"); 
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

  if (!Email) {
    return res.status(400).json({ error: "E-mail é obrigatório" });
  }

  try {
    const resetToken = await User.generatePasswordResetToken(Email);

    // Substitua pela URL do seu frontend
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(Email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: "Recuperação de Senha",
      html: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #ff6f61; text-align: center;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Você solicitou a recuperação de senha da Psiporto. Clique no botão abaixo para redefinir sua senha:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #ff6f61; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Redefinir Senha
            </a>
          </div>
          <p>Se você não solicitou isso, ignore este e-mail.</p>
          <p style="font-size: 12px; color: #777; text-align: center;">
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Um e-mail com instruções foi enviado para o seu endereço." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  console.log("Corpo da requisição recebido:", req.body); // <-- Adicione este log

  const { Email, resetToken, newPassword } = req.body;

  if (!Email || !resetToken || !newPassword) {
    return res.status(400).json({ error: "E-mail, token e nova senha são obrigatórios" });
  }

  try {
    await User.resetPassword(Email, resetToken, newPassword);
    res.json({ message: "Senha redefinida com sucesso." });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
  