const express = require('express');
const jwt = require('jsonwebtoken');
const useragent = require('useragent');
const { v4: uuid } = require('uuid');

const apiRoutes = express.Router();

const BusinessError = require('../common/BusinessError');
const ErrorMsg = require('../common/errorMsg');
const { user, logInfo } = require('../model/index.js');
const { checkPwd, writeRequestInfo } = require('../utils/utils');
const logger = require('../utils/logger');
const { setRedis } = require('../utils/redis');
const { SuccessResult } = require('../result/Result.js');

const secret = process.env.TOKEN_SECRET;

/**
 * 记录登录日志
 * @param {*} params
 * @param {*} username
 * @param {*} status 
 * @returns 
 */
const writeLogInfo = (params, username, status) => {
  logger.info(`login info ${JSON.stringify(params)}`);

  const agent = useragent && params && params['user-agent'] ? useragent.parse(params['user-agent']) : undefined;
  return logInfo.create({
    username,
    ipaddr: params.host,
    login_location: '内网登录',
    browser: agent && agent.toAgent ? agent.toAgent() : '',
    os: agent && agent.os ? agent.os.toString() : '',
    status,
  });
};

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - 登录
 *     summary: 登录获取 token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *                 example: test
 *               password:
 *                 type: string
 *                 description:  密码
 *                 example: 123456
 * 
 *     responses:
 *       200:
 *         description: 查询成功，返回用户信息及 token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean 
 *                 code: 
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: 用户 id.
 *                       example: b719790e-090f-4a1b-8de7-de2f9ed79aeb
 *                     username:
 *                       type: string
 *                       description: 账户名
 *                       example: test
 *                     name:
 *                       type: string
 *                       description: 角色名
 *                       example: 测试人员
 *                     authority:
 *                       type: string
 *                       description: 权限编码
 *                       example: test
 *                     avatar:
 *                       type: string
 *                       description: 用户头像图片路径
 *                       example: test
 *                     token:
 *                       type: string
 *                       description: token
 *                       example: 48ae78df-29b4-42cb-8015-c3140535f40a
 */
apiRoutes.post('/', async (req, res, next) => {
  const { username, password } = req.body;

  if(!username || !password) {
    next(new BusinessError(500, ErrorMsg['EMPTY_LOGIN_INFO']));
    return;
  }

  const userRow = await user.findOne({
    raw: true,
    where: {
      username,
    },
  });

  if(!userRow) {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
    return;
  }

  // 校验密码
  const isValid = checkPwd(password, userRow.password || '');
  let loginStatus = 0; // 登录状态 1成功 0失败

  // 登录失败
  if(!isValid) {
    writeLogInfo(req.headers, username, loginStatus).then(() => {
      next(new BusinessError(401, ErrorMsg['AUTH_FAILED']));
    });
    return;
  }

  loginStatus = 1;
  // 生成 token
  jwt.sign({ ...userRow }, secret, {
    algorithm: 'HS256',
    expiresIn: '12h', // '1d'
  }, async (err, token) => {
    if(err) {
      next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
      return;
    }

    const uid = uuid().toString();
    await setRedis(uid, token);

    const result = {
      userId: userRow.user_id,
      username,
      name: userRow.name,
      id: userRow.id,
      authority: userRow.authority,
      avatar: userRow.avatar,
      token: uid,
    };

    await writeRequestInfo({
      params: req.headers, 
      path: '/login', 
      userId: userRow.user_id, 
      status: loginStatus,
    });

    // 设置cookie
    res.cookie('Authorization', uid, {
      // maxAge: 900000,
      httpOnly: true,
    });

    // 记录登录日志
    writeLogInfo(req.headers, username, loginStatus).then(() => {
      res.status(200).json(SuccessResult(result));
    });
  });
});

/**
 * @swagger
 * /login/get-temp-token:
 *   get:
 *     tags:
 *       - 登录
 *     summary: 获取临时登录凭证
 *     description:
 *     produces:
 *       - application/json
 *     parameters:
 *      
 *     responses:
 *       200:
 *         description: 查询成功，返回用户信息及 token(有效期 12 小时)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean 
 *                 code: 
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: 用户 id.
 *                       example: b719790e-090f-4a1b-8de7-de2f9ed79aeb
 *                     username:
 *                       type: string
 *                       description: 用户名
 *                       example: test
 *                     token:
 *                       type: string
 *                       description: token
 *                       example: 48ae78df-29b4-42cb-8015-c3140535f40a
 */
apiRoutes.get('/get-temp-token', async (req, res, next) => {
  const userRow = await user.findOne({
    raw: true,
    where: {
      username: 'test',
    },
  });

  if(!userRow) {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
    return;
  }

  if(userRow && userRow.user_id) {
    // 生成 token
    jwt.sign({ ...userRow }, secret, {
      algorithm: 'HS256',
      expiresIn: '12h',
    }, async (err, token) => {
      if(err) {
        next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
        return;
      }

      const uid = uuid().toString();
      await setRedis(uid, token);

      const result = {
        userId: userRow.user_id,
        username: userRow.username,
        token: uid,
      };

      await writeRequestInfo({
        params: req.headers, 
        path: '/login/get-temp-token', 
        userId: userRow.user_id, 
        status: 1,
      });

      res.cookie('Authorization', uid, {
        // maxAge: 900000,
        httpOnly: true,
      });

      // 记录登录日志
      writeLogInfo(req.headers, userRow.username, 1).then(() => {
        res.status(200).json(SuccessResult(result));
      });
    });
  } else {
    next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
  }
});

module.exports = apiRoutes;