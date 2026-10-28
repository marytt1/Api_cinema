const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../errors');

// Middleware de autenticação e autorização
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(new UnauthorizedError('Token ausente'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError('Token inválido ou expirado'));
  }
}

// Middleware de autorização baseado em roles
const role = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : next(new ForbiddenError('Permissão insuficiente'));

module.exports = { auth, role };