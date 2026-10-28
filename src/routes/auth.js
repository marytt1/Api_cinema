const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');
const authService = require('../services/authService');

// Validação de dados de registro e login
const registerSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email().toLowerCase(),
  senha: z.string().min(6).max(72),
});
const loginSchema = z.object({ email: z.string().email().toLowerCase(), senha: z.string().min(1) });

router.post('/register', validate(registerSchema),
  asyncHandler(async (req, res) => res.status(201).json(await authService.register(req.body))));

router.post('/login', validate(loginSchema),
  asyncHandler(async (req, res) => res.json(await authService.login(req.body))));

module.exports = router;