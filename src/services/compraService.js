const { UniqueConstraintError } = require('sequelize');
const { sequelize, Sessao, Sala, Assento, Ingresso, Compra, Cliente } = require('../models');
const {
  AssentoIndisponivelError, ElegibilidadeError, NotFoundError, BadRequestError, ForbiddenError,
} = require('../errors');
const { calcularPreco, MEIA_PERMITIDA_PARA } = require('./precoService');

// Processa a compra de ingressos para uma sessão
async function processarCompra({ clienteId, sessaoId, ingressos }) {
  try {
    return await sequelize.transaction(async (t) => {
      // Trava a linha da sessão: compras concorrentes da mesma sessão ficam em fila
      const sessao = await Sessao.findByPk(sessaoId, { lock: t.LOCK.UPDATE, transaction: t });
      if (!sessao) throw new NotFoundError('Sessão não encontrada');
      if (sessao.inicio.getTime() < Date.now()) throw new BadRequestError('Sessão já iniciada');

      // Disponibilidade dos assentos
      const ids = ingressos.map((i) => i.assentoId);
      if (new Set(ids).size !== ids.length) throw new BadRequestError('Assento repetido na compra');

      const assentos = await Assento.findAll({
        where: { id: ids, salaId: sessao.salaId }, transaction: t,
      });
      if (assentos.length !== ids.length) {
        throw new AssentoIndisponivelError('Assento inválido para esta sessão');
      }
      const ocupados = await Ingresso.count({ where: { sessaoId, assentoId: ids }, transaction: t });
      if (ocupados > 0) throw new AssentoIndisponivelError('Assento já vendido');

      // Elegibilidade
      const cliente = await Cliente.findByPk(clienteId, { transaction: t });
      if (!cliente) throw new NotFoundError('Cliente não encontrado');
      const temMeia = ingressos.some((i) => i.tipo === 'MEIA');
      if (temMeia && !MEIA_PERMITIDA_PARA.includes(cliente.tipo)) {
        throw new ElegibilidadeError('Sem direito à meia-entrada');
      }

      // Preço (sempre calculado no servidor) e gravação
      const sala = await Sala.findByPk(sessao.salaId, { transaction: t });
      const itens = ingressos.map((i) => ({
        assentoId: i.assentoId,
        tipo: i.tipo,
        preco: calcularPreco(sessao, sala, cliente, i.tipo),
      }));
      const valorTotal = Math.round(itens.reduce((s, i) => s + i.preco, 0) * 100) / 100;

      const compra = await Compra.create({ clienteId, sessaoId, valorTotal }, { transaction: t });
      await Ingresso.bulkCreate(
        itens.map((i) => ({ ...i, compraId: compra.id, sessaoId })),
        { transaction: t }
      );

      return {
        compraId: compra.id,
        dataCompra: compra.createdAt,
        ticketsGerados: itens,
        valorTotal,
      };
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw new AssentoIndisponivelError('Assento já vendido');
    throw err;
  }
}
// Obtém o recibo de uma compra, com detalhes dos ingressos
async function obterRecibo(id, user) {
  const compra = await Compra.findByPk(id, { include: [{ model: Ingresso, as: 'ingressos' }] });
  if (!compra) throw new NotFoundError('Compra não encontrada');
  if (compra.clienteId !== user.id && user.role !== 'ADMIN') throw new ForbiddenError();
  return compra;
}

module.exports = { processarCompra, obterRecibo };
