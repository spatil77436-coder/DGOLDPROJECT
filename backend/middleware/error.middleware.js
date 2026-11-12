export function notFound(req, _res, next) {
  next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), { statusCode: 404 }));
}
export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (error.code === "P2002" ? 409 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, message: status >= 500 ? "Internal server error" : error.message, ...(error.details ? { details: error.details } : {}) });
}
