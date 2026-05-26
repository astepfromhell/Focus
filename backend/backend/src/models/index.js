const pool = require('../config/database');

module.exports = {
  // 返回与 mysql2 原始 query 相同的结果 [rows, fields]
  query: async (sql, params) => {
    return pool.query(sql, params);
  },
  pool
};
