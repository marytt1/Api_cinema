// Middleware para lidar com funções assíncronas e capturar erros
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);