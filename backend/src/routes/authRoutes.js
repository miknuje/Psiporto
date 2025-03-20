const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Rota para login
router.post("/login", authController.login);

// Rota para recuperação de senha
router.post("/forgot-password", authController.forgotPassword);

// Rota para redefinir a senha
router.post("/reset-password", authController.resetPassword);

// Rota para mudança de senha (protegida por autenticação)
router.post("/change-password", authMiddleware, authController.changePassword);

// Rota para obter informações do usuário autenticado
router.get("/me", authMiddleware, authController.getUserInfo);

module.exports = router;
