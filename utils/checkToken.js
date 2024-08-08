/**
 * 校验 token
 */
const jwt = require('jsonwebtoken');
// const config = require('../common/config');
const { writeRequestInfo } = require('./utils');
const ErrorMsg = require('../common/errorMsg');
const { getRedis } = require('./redis');
const logger = require('./logger');

module.exports = async (req, res, next) => {
  // const access_token = req.headers.cookie ? req.headers.cookie.split('=') : [];
  // const token = (access_token.length ? access_token[1] : '');

  const reqUrl = req?.url ?? '';
  const path = reqUrl ? reqUrl.split('?')[0] : reqUrl;

  const tokenKey = req.body.token || req.query.token || req.headers.authorization;

  logger.info(`header token : ${tokenKey}`);
  const token = await getRedis(tokenKey);

  const secret = process.env.TOKEN_SECRET;

  if (token) {
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        await writeRequestInfo({
          params: req.headers, 
          path, 
          userId: decoded?.user_id ?? '', 
          status: 0, 
          config: ErrorMsg['AUTH_FAILED']
        });
        return res.status(401).json(ErrorMsg['AUTH_FAILED']);
      }

      req.decoded = decoded;
      next();
    });
  } else {
    await writeRequestInfo({
      params: req.headers, 
      path, 
      userId: decoded?.user_id ?? '', 
      status: 0, 
      config: ErrorMsg['AUTH_FAILED']
    });
    return res.status(401).json(ErrorMsg['AUTH_FAILED']);
  }
};
