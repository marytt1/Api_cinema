const { Op } = require('sequelize');
const { Sessao, Filme, Sala, Assento, Ingresso } = require('../models');
const { NotFoundError, ConflictError } = require('../errors');

function listar({ filmeId, data }) {
  const where = {};
  if (filmeId) where.filmeId = filmeId;
  if (data) {
    const ini = new Date(`${data}T00:00:00`);
    where.inicio = { [Op.gte]: ini, [Op.lt]: new Date(ini.getTime() + 86400000) };
  }
  return Sessao.findAll({ where, include: [Filme, Sala], order: [['inicio', 'ASC']] });
}

// Cria uma sessão, validando existência de filme e sala, e evitando sobreposição de horários na mesma sala
async function criar({ filmeId, salaId, inicio, precoBase }) {
  const filme = await Filme.findByPk(filmeId);
  if (!filme) throw new NotFoundError('Filme não encontrado');
  const sala = await Sala.findByPk(salaId);
  if (!sala) throw new NotFoundError('Sala não encontrada');

  // impede sobreposição de horários na mesma sala
  const novoIni = inicio.getTime();
  const novoFim = novoIni + filme.duracao * 60000;
  const proximas = await Sessao.findAll({
    where: { salaId, inicio: { [Op.gte]: new Date(novoIni - 86400000), [Op.lt]: new Date(novoFim) } },
    include: [Filme],
  });
  const conflito = proximas.some((s) => {
    const ini = s.inicio.getTime();
    return ini < novoFim && ini + s.Filme.duracao * 60000 > novoIni;
  });
  if (conflito) throw new ConflictError('Já existe sessão nessa sala neste horário');

  return Sessao.create({ filmeId, salaId, inicio, precoBase });
}

// Mapa de assentos em tempo real: cada assento com status LIVRE ou OCUPADO
async function mapaAssentos(sessaoId) {
  const sessao = await Sessao.findByPk(sessaoId);
  if (!sessao) throw new NotFoundError('Sessão não encontrada');

  const [assentos, vendidos] = await Promise.all([
    Assento.findAll({ where: { salaId: sessao.salaId }, order: [['fileira', 'ASC'], ['numero', 'ASC']] }),
    Ingresso.findAll({ where: { sessaoId }, attributes: ['assentoId'] }),
  ]);
  const ocupados = new Set(vendidos.map((i) => i.assentoId));

  return {
    sessaoId,
    assentos: assentos.map((a) => ({
      id: a.id,
      fileira: a.fileira,
      numero: a.numero,
      status: ocupados.has(a.id) ? 'OCUPADO' : 'LIVRE',
    })),
  };
}

module.exports = { listar, criar, mapaAssentos };
