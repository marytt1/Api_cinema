const { ZodError } = require('zod');
const { AppError } = require('../errors');

// Middleware de tratamento de erros
module.exports = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: err.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
    });
  }
  // Tratamento de erros de parsing JSON
  if (err.type === 'entity.parse.failed') {
  return res.status(400).json({ erro: 'JSON malformado no corpo da requisição' });
  }
  if (err instanceof AppError) return res.status(err.status).json({ erro: err.message });
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erro: 'Registro duplicado' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
};
