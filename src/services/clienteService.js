const { Cliente, Compra, Ingresso, Sessao, Filme } = require('../models');
const { NotFoundError } = require('../errors');

async function obterPerfil(id) {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) throw new NotFoundError('Cliente não encontrado');
  return cliente;
}

function listarCompras(clienteId) {
  return Compra.findAll({
    where: { clienteId },
    include: [{ model: Ingresso, as: 'ingressos' }, { model: Sessao, include: [Filme] }],
    order: [['createdAt', 'DESC']],
  });
}

// Ação de ADMIN: concede/revoga categoria
async function alterarTipo(id, tipo) {
  const cliente = await obterPerfil(id);
  cliente.tipo = tipo;
  await cliente.save();
  return cliente;
}

module.exports = { obterPerfil, listarCompras, alterarTipo };
