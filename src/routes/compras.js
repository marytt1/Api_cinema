const router = require('express').Router();
const { z } = require('zod');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');
const compraService = require('../services/compraService');

// clienteId NÃO vem no corpo: é tirado do token JWT
const compraSchema = z.object({
  sessaoId: z.coerce.number().int().positive(),
  ingressos: z.array(z.object({
    assentoId: z.coerce.number().int().positive(),
    tipo: z.enum(['INTEIRA', 'MEIA']),
  })).min(1).max(10),
});

// Rotas protegidas para compras
router.use(auth);
router.post('/', validate(compraSchema), asyncHandler(async (req, res) => {
  const recibo = await compraService.processarCompra({ ...req.body, clienteId: req.user.id });
  res.status(201).json(recibo);
}));
router.get('/:id', asyncHandler(async (req, res) =>
  res.json(await compraService.obterRecibo(req.params.id, req.user))));

module.exports = router;