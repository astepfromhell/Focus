exports.success = (res, data = {}, message = '操作成功', status = 200) => {
  return res.status(status).json({ success: true, data, message });
};

exports.error = (res, error = '操作失败', code = 'ERROR', status = 400) => {
  const payload = { success: false, error, code };
  return res.status(status).json(payload);
};
