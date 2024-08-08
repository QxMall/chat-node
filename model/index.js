const Sequelize = require('sequelize');
const config = require('../common/config');

const UserModel = require('./User'); // 用户信息
const LogInfoModel = require('./LogInfo'); // 登录日志
const SysRoleModel = require('./SysRole'); // 角色信息
const PostInfoModel = require('./PostInfo'); // 岗位信息
const SysMenuModel = require('./SysMenu'); // 菜单信息
const DictTypeModel = require('./DictType'); // 字典类型
const DictDataModel = require('./DictData'); // 字典列表
const RequestInfoModel = require('./RequestInfo'); // 接口请求日志
const TokenInfoModel = require('./TokenInfo'); // token 信息统计表
// const { getDatabasePwd } = require('../utils/utils');

// const { v4: uuid } = require('uuid');
// const { getHsahPwd } = require('../utils/utils');

const pwd = process.env.DATABASE_PASSWORD;

const sequelize = new Sequelize(config.database, config.loginName, pwd, {
  host: config.host,
  dialect: config.dialect,
  dialectOptions: {
    // useUTC: false, // for reading from database
    dateStrings: true,
    typeCast: true,
  },
  timezone: '+08:00',
});

const user = UserModel(sequelize, Sequelize.DataTypes);
const logInfo = LogInfoModel(sequelize, Sequelize.DataTypes);
const sysRole = SysRoleModel(sequelize, Sequelize.DataTypes);
const postInfo = PostInfoModel(sequelize, Sequelize.DataTypes);
const sysMenu = SysMenuModel(sequelize, Sequelize.DataTypes);
const dictType = DictTypeModel(sequelize, Sequelize.DataTypes);
const dictList = DictDataModel(sequelize, Sequelize.DataTypes);
const requestInfo = RequestInfoModel(sequelize, Sequelize.DataTypes);
const tokenInfo = TokenInfoModel(sequelize, Sequelize.DataTypes);

// sequelize.sync({ force: true }); // 同步所有表模型

// requestInfo.sync({ force: true });
// tokenInfo.sync({ force: true });

// user.sync({ force: true })
//   .then(() => {
//     user.create({
//       username: 'admin',
//       password: getHsahPwd('LuoYao.5731'),
//       name: '管理员',
//       authority: 'admin',
//       role_id: 1,
//       user_id: uuid(),
//       avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
//     });
//     user.create({
//       username: 'test',
//       password: getHsahPwd('123456'),
//       name: '临时用户',
//       authority: 'test',
//       role_id: 2,
//       user_id: uuid(),
//       avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
//     });
//   });

module.exports = {
  sequelize,
  user,
  logInfo,
  sysRole,
  postInfo,
  sysMenu,
  dictType,
  dictList,
  requestInfo,
  tokenInfo,
  QueryTypes: Sequelize.QueryTypes,
};
