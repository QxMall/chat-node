/**
 * 登录日志表
 * @param {*} sequelize 
 * @param {*} dataType 
 * @returns 
 */

module.exports = (sequelize, dataType) => {
  return sequelize.define('LogInfo', {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataType.INTEGER,
    },
    username: {
      type: dataType.CHAR(50),
      allowNull: false,
    },
    ipaddr: {
      type: dataType.CHAR(128),
      allowNull: false,
    },
    login_location: {
      type: dataType.CHAR(255),
      allowNull: true,
    },
    browser: {
      type: dataType.CHAR(50),
      allowNull: false,
    },
    os: {
      type: dataType.CHAR(50),
      allowNull: false,
    },
    status: {
      type: dataType.CHAR(50),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'LogInfo',
    tableName: 'sys_login_info',
    timestamps: true, // 使用自带的时间戳自带 必须启用，默认启用
    updatedAt: false, // 不增加此字段
    createdAt: 'login_time', // 自定义字段名
  });
};
