/**
 * 错误处理异常类
 */
class BusinessError extends Error {
  constructor(httpCode = 500, { code = '000001', msg = '服务器发生错误' }) {
    super(msg);
    this.httpCode = httpCode;
    this.code = code;
    this.msg = msg;
    this.name = 'BusinessError';
  }
}

module.exports = BusinessError;