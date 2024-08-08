/**
 * 角色表
 * @param {*} sequelize 
 * @param {*} dataTypes 
 * @returns 
 */
module.exports = (sequelize, dataTypes) => {
  return sequelize.define('SysRole', {
    role_id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataTypes.INTEGER,
      comment: '角色id',
    },
    role_name: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      comment: '角色名称',
    },
    role_key: {
      type: dataTypes.CHAR(100),
      allowNull: false,
      comment: '角色权限字符',
    },
    role_sort: {
      type: dataTypes.INTEGER,
      comment: '显示顺序',
    },
    data_scope: {
      type: dataTypes.CHAR(1),
      defaultValue: '1',
      comment: '数据范围（1：全部数据权限 2：自定义数据权限 3：本部门数据权限 4：本部门及以下数据权限）',
    },
    menu_check_strictly: {
      type: dataTypes.CHAR(1),
      comment: '菜单树选择项是否关联显示',
    },
    dept_check_strictly: {
      type: dataTypes.CHAR(1),
      comment: '部门树选择项是否关联显示',
    },
    status: {
      type: dataTypes.CHAR(1),
      defaultValue: '0',
      allowNull: false,
      comment: '角色状态（0正常 1停用）',
    },
    del_flag: {
      type: dataTypes.CHAR(1),
      defaultValue: '0',
      comment: '删除标志(0正常1删除)',
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
    tableName: 'sys_role',
  });
};