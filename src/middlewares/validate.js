// Valida e substitui req.body pelo resultado do schema zod
module.exports = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body ?? {});
    next();
  } catch (err) {
    next(err);
  }
};
