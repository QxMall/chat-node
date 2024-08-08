/**
 * 校验 角色
 */
const jwt = require('jsonwebtoken');
// const config = require('../common/config');
const { writeRequestInfo } = require('./utils');
const ErrorMsg = require('../common/errorMsg');
const { getRedis } = require('./redis');
const logger = require('./logger');

module.exports = (permissions = []) => {
  return async (req, res, next) => {

    const reqUrl = req?.url ?? '';
    const path = reqUrl ? reqUrl.split('?')[0] : reqUrl;

    const tokenKey = req.body.token || req.query.token || req.headers.authorization;

    const token = await getRedis(tokenKey);

    const secret = process.env.TOKEN_SECRET;

    if (token) {
      jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
          return res.status(401).json(ErrorMsg['AUTH_FAILED']);
        }

        const permission = decoded.authority; // 权限
        if (!(permissions.length && permissions.includes(permission))) {
          logger.error(`用户 ${decoded.username} 无权限访问 ${reqUrl}`);

          await writeRequestInfo({
            params: req.headers, 
            path, 
            userId: decoded?.user_id ?? '', 
            status: 0, 
            config: ErrorMsg['ACCESS_DENIED_ERROR']
          });
          return res.status(403).json(ErrorMsg['ACCESS_DENIED_ERROR']);
        }

        req.decoded = decoded;
        next();
      });
    } else {
      return res.status(401).json(ErrorMsg['AUTH_FAILED']);
    }
  };
};
