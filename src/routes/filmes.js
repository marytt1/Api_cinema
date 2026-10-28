const router = require('express').Router();
const { z } = require('zod');
const { auth, role } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');
const catalogo = require('../services/catalogoService');

const filmeSchema = z.object({
  titulo: z.string().min(1).max(200),
  duracao: z.number().int().positive(),
  classificacao: z.string().min(1).max(10),
  ativo: z.boolean().optional(),
});

// Rotas protegidas para filmes
router.use(auth);
router.get('/', asyncHandler(async (req, res) => res.json(await catalogo.listarFilmes(req.query))));
router.get('/:id', asyncHandler(async (req, res) => res.json(await catalogo.obterFilme(req.params.id))));
router.post('/', role('ADMIN'), validate(filmeSchema),
  asyncHandler(async (req, res) => res.status(201).json(await catalogo.criarFilme(req.body))));

module.exports = router;