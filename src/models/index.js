const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const id = () => ({ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true });
const fk = () => ({ type: DataTypes.INTEGER, allowNull: false });

// Define os modelos do banco de dados usando Sequelize
const Filme = sequelize.define('Filme', {
  id: id(),
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  duracao: { type: DataTypes.INTEGER, allowNull: false }, // minutos
  classificacao: { type: DataTypes.STRING(10), allowNull: false },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'filmes' });

const Sala = sequelize.define('Sala', {
  id: id(),
  nome: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  tipo: { type: DataTypes.ENUM('PADRAO', 'VIP'), allowNull: false, defaultValue: 'PADRAO' },
  capacidade: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'salas' });

const Assento = sequelize.define('Assento', {
  id: id(),
  salaId: fk(),
  fileira: { type: DataTypes.STRING(2), allowNull: false },
  numero: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'assentos',
  indexes: [{ unique: true, fields: ['salaId', 'fileira', 'numero'] }],
});

const Sessao = sequelize.define('Sessao', {
  id: id(),
  filmeId: fk(),
  salaId: fk(),
  inicio: { type: DataTypes.DATE, allowNull: false },
  precoBase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'sessoes' });

const Cliente = sequelize.define('Cliente', {
  id: id(),
  nome: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
  senhaHash: { type: DataTypes.STRING(100), allowNull: false },
  tipo: {
    type: DataTypes.ENUM('PADRAO', 'ESTUDANTE', 'IDOSO', 'VIP', 'CINEFILO'),
    allowNull: false, defaultValue: 'PADRAO',
  },
  role: { type: DataTypes.ENUM('CLIENTE', 'ADMIN'), allowNull: false, defaultValue: 'CLIENTE' },
}, {
  tableName: 'clientes',
  defaultScope: { attributes: { exclude: ['senhaHash'] } },
});

const Compra = sequelize.define('Compra', {
  id: id(),
  clienteId: fk(),
  sessaoId: fk(),
  valorTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'compras' });

const Ingresso = sequelize.define('Ingresso', {
  id: id(),
  compraId: fk(),
  sessaoId: fk(),
  assentoId: fk(),
  tipo: { type: DataTypes.ENUM('INTEIRA', 'MEIA'), allowNull: false },
  preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'ingressos',
  // segunda barreira contra venda duplicada do mesmo assento na mesma sessão
  indexes: [{ unique: true, name: 'uq_sessao_assento', fields: ['sessaoId', 'assentoId'] }],
});
// Define os relacionamentos entre os modelos
Sala.hasMany(Assento, { foreignKey: 'salaId', as: 'assentos' });
Assento.belongsTo(Sala, { foreignKey: 'salaId' });

Filme.hasMany(Sessao, { foreignKey: 'filmeId' });
Sessao.belongsTo(Filme, { foreignKey: 'filmeId' });
Sala.hasMany(Sessao, { foreignKey: 'salaId' });
Sessao.belongsTo(Sala, { foreignKey: 'salaId' });

Cliente.hasMany(Compra, { foreignKey: 'clienteId' });
Compra.belongsTo(Cliente, { foreignKey: 'clienteId' });
Sessao.hasMany(Compra, { foreignKey: 'sessaoId' });
Compra.belongsTo(Sessao, { foreignKey: 'sessaoId' });

Compra.hasMany(Ingresso, { foreignKey: 'compraId', as: 'ingressos' });
Ingresso.belongsTo(Compra, { foreignKey: 'compraId' });
Assento.hasMany(Ingresso, { foreignKey: 'assentoId' });
Ingresso.belongsTo(Assento, { foreignKey: 'assentoId' });
Sessao.hasMany(Ingresso, { foreignKey: 'sessaoId' });
Ingresso.belongsTo(Sessao, { foreignKey: 'sessaoId' });

module.exports = { sequelize, Filme, Sala, Assento, Sessao, Cliente, Compra, Ingresso };
