/**
 * 接口请求日志表
 * @param {*} sequelize 
 * @param {*} dataType 
 * @returns 
 */

module.exports = (sequelize, dataType) => {
  return sequelize.define('RequestInfo', {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataType.INTEGER,
    },
    userId: {
      type: dataType.STRING(64),
      allowNull: true,
    },
    path: {
      type: dataType.STRING(128),
      allowNull: true,
    },
    ipaddr: {
      type: dataType.STRING(32),
      allowNull: true,
    },
    login_location: {
      type: dataType.STRING(255),
      allowNull: true,
    },
    browser: {
      type: dataType.STRING(50),
      allowNull: true,
    },
    os: {
      type: dataType.STRING(50),
      allowNull: true,
    },
    status: {
      type: dataType.STRING(2),
      allowNull: true,
      comment: '请求状态：1 成功，0 失败',
    },
    req_msg: {
      type: dataType.STRING(255),
      allowNull: true,
      comment: '请求数据',
    },
    resp_msg: {
      type: dataType.TEXT,
      allowNull: true,
      comment: '响应数据',
    },
    req_tokens: {
      type: dataType.INTEGER,
      allowNull: true,
      comment: '请求数据 token 数',
    },
    resp_tokens: {
      type: dataType.INTEGER,
      allowNull: true,
      comment: '响应数据 token 数',
    },
    description: {
      type: dataType.TEXT,
      allowNull: true,
      comment: '备注',
    },
  }, {
    sequelize,
    modelName: 'RequestInfo',
    tableName: 'sys_request_info',
    timestamps: true, // 使用自带的时间戳自带 必须启用，默认启用
    updatedAt: false, // 不增加此字段
    createdAt: 'creation_time', // 自定义字段名
  });
};
