/**
 * 用户表
 * @param {*} sequelize 
 * @param {*} dataTypes 
 * @returns 
 */
module.exports = (sequelize, dataTypes) => {
  return sequelize.define('User', {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: dataTypes.INTEGER,
    },
    username: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      comment: '用户账号',
    },
    name: {
      type: dataTypes.CHAR(36),
      comment: '用户名称',
    },
    user_type: {
      type: dataTypes.CHAR(2),
      defaultValue: '00',
      comment: '用户类型(00 系统用户)',
    },
    avatar: {
      type: dataTypes.CHAR(255),
      defaultValue: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      comment: '用户头像',
    },
    password: {
      type: dataTypes.CHAR(255),
      allowNull: false,
      comment: '密码',
    },
    user_id: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      comment: '用户id',
    },
    role_id: {
      type: dataTypes.INTEGER,
      defaultValue: 2,
      comment: '角色id(1管理员2访客)',
    },
    post_id: {
      type: dataTypes.INTEGER,
      comment: '岗位id',
    },
    dept_id: {
      type: dataTypes.CHAR(36),
      defaultValue: '100000',
      comment: '部门id',
    },
    authority: {
      type: dataTypes.CHAR(36),
      allowNull: false,
      defaultValue: 'customer',
      comment: '权限类型(默认访客)',
    },
    email: {
      type: dataTypes.CHAR(36),
    },
    phonenumber: {
      type: dataTypes.CHAR(36),
    },
    status: {
      type: dataTypes.CHAR(1),
      defaultValue: '0',
      comment: '账号状态(0正常1停用)',
    },
    del_flag: {
      type: dataTypes.CHAR(1),
      defaultValue: '0',
      comment: '删除标志(0正常1删除)',
    },
    login_ip: {
      type: dataTypes.CHAR(128),
      comment: '最后登录IP',
    },
    login_date: {
      type: dataTypes.DATE,
      comment: '最后登录时间',
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
    tableName: 'sys_user',
  });
};