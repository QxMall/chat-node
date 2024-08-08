/**
 * 岗位信息表
 * @param {*} sequelize 
 * @param {*} dataTypes 
 * @returns 
 */
module.exports = (sequelize, dataTypes) => {
  return sequelize.define('PostInfo', {
    post_id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataTypes.INTEGER,
      comment: '岗位信息id',
    },
    post_code: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      comment: '岗位编码',
    },
    post_name: {
      type: dataTypes.CHAR(100),
      allowNull: false,
      comment: '岗位名称',
    },
    post_sort: {
      type: dataTypes.INTEGER,
      comment: '显示顺序',
    },
    status: {
      type: dataTypes.CHAR(1),
      defaultValue: '0',
      allowNull: false,
      comment: '岗位状态（0正常 1停用）',
    },
    create_by: {
      type: dataTypes.CHAR(64),
      defaultValue: '管理员',
      comment: '创建人',
    },
    remark: {
      type: dataTypes.CHAR(255),
      comment: '备注',
    },
  }, {
    sequelize,
    tableName: 'sys_post',
  });
};