export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!parsed.success) return next(Object.assign(new Error("Validation failed"), { statusCode: 422, details: parsed.error.flatten() }));
  req.validated = parsed.data;
  next();
};
