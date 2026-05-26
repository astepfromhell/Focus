module.exports = (err, req, res, _next) => {
  const isMulterError = err.name === 'MulterError';
  const status = err.status || (isMulterError ? 400 : 500);
  const code = err.code || (isMulterError ? 'UPLOAD_ERROR' : 'SERVER_ERROR');
  const message = err.message || '服务器内部错误';
  if ((process.env.NODE_ENV || 'development') === 'development') {
    console.error(err);
  }
  return res.status(status).json({ success: false, error: message, code });
};
