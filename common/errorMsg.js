/**
 * 错误信息统一配置
 */
module.exports = {
  OPERATION_SUCCEED: {
    code: '000000',
    msg: '操作成功',
  },

  SERVER_ERROR: { 
    code: '000001',
    msg: '系统错误',
  },

  NO_SUCH_USER_INFO: {
    code: '000002',
    msg: '无此用户信息',
  },

  AUTH_FAILED: {
    code: '000003',
    msg: '用户认证失败',
  },

  EMPTY_LOGIN_INFO: {
    code: '000004',
    msg: '用户名密码不能为空',
  },

  UPLOAD_FAILED: {
    code: '000005',
    msg: '文件上传失败',
  },

  DATA_CHECK_ERROR: {
    code: '000006',
    msg: '数据校验错误',
  },

  REQ_PARAM_ERROR: {
    code: '000007',
    msg: '参数错误',
  },

  ACCESS_DENIED_ERROR: {
    code: '000008',
    msg: '无权访问',
  },

  BALANCE_EXHAUSTED_ERROR: {
    code: '000009',
    msg: '余额已用尽',
  },
};