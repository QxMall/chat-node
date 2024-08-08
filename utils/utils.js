const bcrypt = require('bcryptjs');
const useragent = require('useragent');
const { v4: uuid } = require('uuid');
// const { profile } = require('../common/config');
const fileOperation = require('./fileOperation');
const uploadUtils = require('./uploadFile');
const { requestInfo } = require('../model/index');
// const models = require('../model/index');
const logger = require('./logger');

/**
 * 获取随机盐值
 * @returns 
 */
const getSalt = () => {
  // 生成salt的迭代次数
  const saltRounds = 10;
  return bcrypt.genSaltSync(saltRounds);
};

/**
 * 获取加盐密码
 * @param {*} password
 */
const getHsahPwd = (password) => {
  const salt = getSalt();
  return bcrypt.hashSync(password, salt);
};

/**
 * 
 * @param {string} inputPwd 输入的密码
 * @param {string} savedPwd 存储的密码
 * @returns 
 */
const checkPwd = (inputPwd = '', savedPwd = '') => {
  const isValid = bcrypt.compareSync(inputPwd, savedPwd);
  return isValid;
};

/**
 * 获取 base64 图片的数据及文件名
 * @param {any} imgData 
 */
const getBase64File = (imgData) => {
  // 过滤data:URL
  const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
  const dataBuffer = Buffer.from(base64Data, 'base64');
  const fileName = `${uuid().toString()}.png`;

  return { dataBuffer, fileName };
};

/**
 * 获取文件存储路径
 */
const getProfile = () => {
  return `${process.env.PROFILE_PATH}`;
};

const getDatabasePwd = () => {
  return `${process.env.DATABASE_PASSWORD}`;
};

/**
 * 记录接口请求日志
 * @returns 
 */
const writeRequestInfo = ({ params, path, userId, status, reqMsg, respMsg, config, reqTokens, respTokens }) => {
  logger.info(`utils request info ${JSON.stringify(params)}`);
  
  const agent = useragent && params && params['user-agent'] ? useragent.parse(params['user-agent']) : undefined;

  return requestInfo?.create({
    userId,
    path,
    ipaddr: params?.host ?? '',
    login_location: '内网登录',
    browser: agent && agent.toAgent ? agent.toAgent() : '',
    os: agent && agent.os ? agent.os.toString() : '',
    req_msg: reqMsg,
    resp_msg: respMsg,
    status,
    description: config?.msg ?? '',
    req_tokens: reqTokens,
    resp_tokens: respTokens,
  });
};

/**
 * 计算字符数
 * @param {*} message 
 * @returns 
 */
const calculatingTokens = (message) => {
  let length = 0;

  if (!message) {
    return 0;
  }

  for (let i = 0; i < message.length; i++) {
    let char = message.charAt(i);
    if (char.match(/[\u4e00-\u9fa5]/)) {
      // 汉字
      length += 1;
    } else {
      // 英文字符
      length += 0.5;
    }
  }

  return length;
};

module.exports = {
  ...fileOperation,
  ...uploadUtils,
  getSalt,
  getHsahPwd,
  getBase64File,
  getProfile,
  checkPwd,
  writeRequestInfo,
  getDatabasePwd,
  calculatingTokens,
};
