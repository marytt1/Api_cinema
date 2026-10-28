const router = require('express').Router();
const { z } = require('zod');
const { auth, role } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');
const catalogo = require('../services/catalogoService');

// Validação de dados de criação de sala
const salaSchema = z.object({
  nome: z.string().min(1).max(50),
  tipo: z.enum(['PADRAO', 'VIP']),
  fileiras: z.number().int().min(1).max(26),
  assentosPorFileira: z.number().int().min(1).max(50),
});

// Rotas protegidas para salas
router.use(auth);
router.get('/', asyncHandler(async (req, res) => res.json(await catalogo.listarSalas())));
router.post('/', role('ADMIN'), validate(salaSchema),
  asyncHandler(async (req, res) => res.status(201).json(await catalogo.criarSala(req.body))));

module.exports = router;