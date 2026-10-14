import { ApiError } from '../utils/ApiError.js';

/** validate(schema, 'body' | 'query' | 'params') – replaces the source with parsed (trimmed/coerced) data. */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(new ApiError(422, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', details));
  }
  if (source === 'query') {
    for (const k of Object.keys(req.query)) delete req.query[k];
    Object.assign(req.query, result.data);
  } else {
    req[source] = result.data;
  }
  return next();
};
