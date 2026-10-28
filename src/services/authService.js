const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Cliente } = require('../models');
const { ConflictError, UnauthorizedError } = require('../errors');

function gerarToken(cliente) {
  return jwt.sign({ role: cliente.role }, process.env.JWT_SECRET, {
    subject: String(cliente.id),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

async function register({ nome, email, senha }) {
  const existe = await Cliente.findOne({ where: { email } });
  if (existe) throw new ConflictError('E-mail já cadastrado');
  const senhaHash = await bcrypt.hash(senha, 10);
  // tipo e role são fixos: categoria especial só é concedida por um ADMIN
  const cliente = await Cliente.create({ nome, email, senhaHash, tipo: 'PADRAO', role: 'CLIENTE' });
  return { cliente }; // token só é emitido no login
}

async function login({ email, senha }) {
  const cliente = await Cliente.unscoped().findOne({ where: { email } });
  const ok = cliente && (await bcrypt.compare(senha, cliente.senhaHash));
  if (!ok) throw new UnauthorizedError('Credenciais inválidas');
  const { senhaHash, ...publico } = cliente.toJSON();
  return { cliente: publico, token: gerarToken(cliente) };
}

module.exports = { register, login };
