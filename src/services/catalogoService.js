const { Filme, Sala, Assento, sequelize } = require('../models');
const { NotFoundError } = require('../errors');

const listarFilmes = ({ ativo }) =>
  Filme.findAll({ where: ativo === undefined ? {} : { ativo: ativo === 'true' }, order: [['titulo', 'ASC']] });

async function obterFilme(id) {
  const filme = await Filme.findByPk(id);
  if (!filme) throw new NotFoundError('Filme não encontrado');
  return filme;
}

const criarFilme = (dados) => Filme.create(dados);

const listarSalas = () => Sala.findAll({ order: [['nome', 'ASC']] });

// Cria a sala e gera os assentos
function criarSala({ nome, tipo, fileiras, assentosPorFileira }) {
  return sequelize.transaction(async (t) => {
    const sala = await Sala.create(
      { nome, tipo, capacidade: fileiras * assentosPorFileira },
      { transaction: t }
    );
    const assentos = [];
    for (let f = 0; f < fileiras; f++) {
      for (let n = 1; n <= assentosPorFileira; n++) {
        assentos.push({ salaId: sala.id, fileira: String.fromCharCode(65 + f), numero: n });
      }
    }
    await Assento.bulkCreate(assentos, { transaction: t });
    return sala;
  });
}

module.exports = { listarFilmes, obterFilme, criarFilme, listarSalas, criarSala };
