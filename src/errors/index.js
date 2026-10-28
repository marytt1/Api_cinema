class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}
// Erros HTTP customizados
class BadRequestError extends AppError { constructor(m = 'Requisição inválida') { super(m, 400); } }
class UnauthorizedError extends AppError { constructor(m = 'Não autenticado') { super(m, 401); } }
class ElegibilidadeError extends AppError { constructor(m = 'Cliente não elegível') { super(m, 403); } }
class ForbiddenError extends AppError { constructor(m = 'Acesso negado') { super(m, 403); } }
class NotFoundError extends AppError { constructor(m = 'Não encontrado') { super(m, 404); } }
class ConflictError extends AppError { constructor(m = 'Conflito') { super(m, 409); } }
class AssentoIndisponivelError extends AppError { constructor(m = 'Assento indisponível') { super(m, 409); } }

// Exporta os erros para uso em outros módulos
module.exports = {
  AppError, BadRequestError, UnauthorizedError, ElegibilidadeError,
  ForbiddenError, NotFoundError, ConflictError, AssentoIndisponivelError,
};