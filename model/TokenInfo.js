/**
 * 用户 token 统计信息表
 * @param {*} sequelize 
 * @param {*} dataType 
 * @returns 
 */

module.exports = (sequelize, dataType) => {
  return sequelize.define('TokenInfo', {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataType.INTEGER,
    },
    user_id: {
      type: dataType.STRING(64),
      allowNull: true,
    },
    tokens: {
      type: dataType.INTEGER,
      allowNull: true,
    },
    description: {
      type: dataType.TEXT,
      allowNull: true,
      comment: '备注',
    },
  }, {
    sequelize,
    modelName: 'TokenInfo',
    tableName: 'user_token_info',
    timestamps: true, // 使用自带的时间戳自带 必须启用，默认启用
    updatedAt: false, // 不增加此字段
    createdAt: 'creation_time', // 自定义字段名
  });
};
