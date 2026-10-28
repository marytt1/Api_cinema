const router = require('express').Router();
const { z } = require('zod');
const { auth, role } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');
const sessaoService = require('../services/sessaoService');

const sessaoSchema = z.object({
  filmeId: z.coerce.number().int().positive(),
  salaId: z.coerce.number().int().positive(),
  inicio: z.coerce.date(),
  precoBase: z.number().positive(),
});

// Rotas protegidas para sessões
router.use(auth);
router.get('/', asyncHandler(async (req, res) => res.json(await sessaoService.listar(req.query))));
router.get('/:id/assentos', asyncHandler(async (req, res) =>
  res.json(await sessaoService.mapaAssentos(req.params.id))));
router.post('/', role('ADMIN'), validate(sessaoSchema),
  asyncHandler(async (req, res) => res.status(201).json(await sessaoService.criar(req.body))));

module.exports = router;
