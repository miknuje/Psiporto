const express = require("express");
const authController = require("../controllers/authController"); // Importe o controlador
const authMiddleware = require("../middleware/authMiddleware"); // Middleware de autenticação

const router = express.Router();

// Rota para login
router.post("/login", authController.login);

// Rota para recuperação de senha
router.post("/forgot-password", authController.forgotPassword);

// Rota para redefinir a senha
router.post("/reset-password", authController.resetPassword);

// Rota para mudança de senha (protegida por autenticação)
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;