import mongoose from 'mongoose';
import { isProd } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let code = err.code && typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';
  let message = err.message;
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 422; code = 'VALIDATION_ERROR'; message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400; code = 'BAD_REQUEST'; message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409; code = 'DUPLICATE'; message = `A record with that ${Object.keys(err.keyPattern || {})[0] || 'value'} already exists`;
  } else if (err.type === 'entity.too.large') {
    status = 413; code = 'PAYLOAD_TOO_LARGE'; message = 'Request body too large';
  } else if (err.type === 'entity.parse.failed') {
    status = 400; code = 'BAD_JSON'; message = 'Malformed JSON body';
  } else if (err.message === 'Not allowed by CORS') {
    status = 403; code = 'CORS_DENIED';
  }

  if (status >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
    if (isProd) { message = 'Something went wrong. Please try again later.'; details = undefined; }
  }

  res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}
