/**
 * 字典类型表
 * @param {*} sequelize 
 * @param {*} dataTypes 
 * @returns 
 */
module.exports = (sequelize, dataTypes) => {
  return sequelize.define('DictData', {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataTypes.INTEGER,
    },
    dict_sort: {
      type: dataTypes.INTEGER,
      comment: '排序',
    },
    dict_code: {
      type: dataTypes.CHAR(100),
      comment: '字典编码',
    },
    dict_label: {
      type: dataTypes.CHAR(100),
      comment: '字典标签',
    },
    dict_value: {
      type: dataTypes.CHAR(100),
      comment: '字典键值',
    },
    status: {
      type: dataTypes.CHAR(1),
      comment: '状态（0正常 1停用）',
    },
    create_by: {
      type: dataTypes.CHAR(128),
      defaultValue: '管理员',
      comment: '创建人',
    },
    remark: {
      type: dataTypes.CHAR(255),
      comment: '备注',
    },
  }, {
    sequelize,
    tableName: 'sys_dict_data',
  });
};