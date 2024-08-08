/**
 * 菜单表
 * @param {*} sequelize 
 * @param {*} dataTypes 
 * @returns 
 */
module.exports = (sequelize, dataTypes) => {
  return sequelize.define('SysMenu', {
    menu_id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataTypes.INTEGER,
      comment: '菜单id',
    },
    menu_name: {
      type: dataTypes.CHAR(50),
      allowNull: false,
      comment: '菜单名称',
    },
    parent_id: {
      type: dataTypes.INTEGER,
      comment: '父级菜单id',
    },
    order_num: {
      type: dataTypes.INTEGER,
      comment: '显示顺序',
    },
    path: {
      type: dataTypes.CHAR(255),
      comment: '页面路由地址',
    },
    component: {
      type: dataTypes.CHAR(255),
      comment: '页面组件路径',
    },
    is_frame: {
      type: dataTypes.INTEGER,
      comment: '是否为外链（0是 1否）',
    },
    is_cache: {
      type: dataTypes.INTEGER,
      comment: '是否缓存（0缓存 1不缓存）',
    },
    menu_type: {
      type: dataTypes.CHAR(1),
      comment: '删除标志(菜单类型（M目录 C菜单 F按钮）)',
    },
    visible: {
      type: dataTypes.CHAR(1),
      comment: '菜单状态（0显示 1隐藏）',
    },
    status: {
      type: dataTypes.CHAR(1),
      comment: '菜单状态（0正常 1停用）',
    },
    perms: {
      type: dataTypes.CHAR(64),
      comment: '权限标识',
    },
    icon: {
      type: dataTypes.CHAR(64),
      comment: '菜单图标',
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
    tableName: 'sys_menu',
  });
};