const router = require('express').Router();
const { z } = require('zod');
const { auth, role } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');
const clienteService = require('../services/clienteService');

const tipoSchema = z.object({ tipo: z.enum(['PADRAO', 'ESTUDANTE', 'IDOSO', 'VIP', 'CINEFILO']) });

// Rotas protegidas para clientes
router.use(auth);
router.get('/me', asyncHandler(async (req, res) => res.json(await clienteService.obterPerfil(req.user.id))));
router.get('/me/compras', asyncHandler(async (req, res) =>
  res.json(await clienteService.listarCompras(req.user.id))));
router.patch('/:id/tipo', role('ADMIN'), validate(tipoSchema),
  asyncHandler(async (req, res) => res.json(await clienteService.alterarTipo(req.params.id, req.body.tipo))));

module.exports = router;