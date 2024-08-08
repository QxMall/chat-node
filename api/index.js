/**
 * 按功能划分 api 列表
 */

const user = require('./user');
// const signup = require('./signup');
const login = require('./login');
const chatAi = require('./chatAi');

module.exports = (app) => {
  // Chat AI 模块
  app.use('/api/chat', chatAi);
  // 用户模块
  app.use('/api/user', user);
  // 注册
  // app.use('/signup', signup);
  // 获取token
  app.use('/login', login);
};
