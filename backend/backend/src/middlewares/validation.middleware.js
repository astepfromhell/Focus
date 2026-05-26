const response = require('../utils/response.util');

module.exports = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = req[property];
    const options = { abortEarly: false, stripUnknown: true, convert: true };
    const { value, error } = schema.validate(data, options);
    if (error) {
      const details = error.details.map((d) => d.message.replace(/"/g, ''));
      return response.error(res, details.join('; '), 'VALIDATION_ERROR', 400);
    }
    req[property] = value;
    return next();
  };
};
