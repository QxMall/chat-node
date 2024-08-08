/**
 * 用户信息接口列表
 */

const express = require('express');
const { user, QueryTypes, sequelize } = require('../model/index.js');
const BusinessError = require('../common/BusinessError');
const ErrorMsg = require('../common/errorMsg');
const { uploadBase64Picture } = require('../utils/uploadFile');
const UserResult = require('../result/User');
const { SuccessResult, FailedResult } = require('../result/Result.js');
const { checkPwd, getHsahPwd, writeRequestInfo } = require('../utils/utils');
const checkRoles = require('../utils/checkRoles');

const apiRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: 用户 id.
 *           example: b719790e-090f-4a1b-8de7-de2f9ed79aeb
 *         username:
 *           type: string
 *           description: 账户名
 *           example: test
 *         name:
 *           type: string
 *           description: 角色名
 *           example: 测试人员
 *         authority:
 *           type: string
 *           description: 权限编码
 *           example: test
 *         avatar:
 *           type: string
 *           description: 用户头像图片路径
 *           example: test
 */

/**
 * @swagger
 * /api/user/get-user-detail:
 *   get:
 *     tags:
 *       - 用户信息
 *     summary: 获取用户详细信息
 *     description:
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: 用户 id
 *         schema:
 *           type: string
 *           example: b719790e-090f-4a1b-8de7-de2f9ed79aeb
 *      
 *     responses:
 *       200:
 *         description: 查询成功，返回用户详情信息
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
 *                   $ref: '#/components/schemas/User'
 */
apiRoutes.get('/get-user-detail', checkRoles(['admin', 'test']), async (req, res, next) => {
  const { userId } = req.query;

  const userList = await sequelize.query(
    'SELECT * FROM  sys_user su WHERE su.user_id = :userId',
    {
      replacements: { userId },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );

  const userRow = userList && userList.length ? userList[0] : {};
  if(userRow && userRow.user_id) {
    await writeRequestInfo({
      params: req.headers, 
      path: '/user/get-user-detail', 
      userId: userRow.user_id, 
      status: 1,
    });
    res.json(SuccessResult(UserResult(userRow)));
  } else {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
  }
});

/**
 * @swagger
 * /api/user/get-user-list:
 *   get:
 *     tags:
 *       - 用户信息
 *     summary: 获取用户列表
 *     description:
 *     produces:
 *       - application/json
 *     parameters:
 *      
 *     responses:
 *       200:
 *         description: 查询成功，返回用户列表
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
 *                   type: array
 *                   items:
*                      $ref: '#/components/schemas/User'
 */
apiRoutes.get('/get-user-list', checkRoles(['admin']), async (req, res, next) => {

  const userList = await sequelize.query(
    'SELECT * FROM  sys_user',
    {
      // replacements: { userId },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );

  if(userList && userList.length) {
    await writeRequestInfo({
      params: req.headers, 
      path: '/user/get-user-list', 
      userId: '', 
      status: 1,
    });
    res.json(SuccessResult(UserResult(userRow)));
  } else {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
  }
});

/**
 * 修改头像
 */
apiRoutes.post('/change-avatar', async (req, res, next) => {
  const { userId, imgData } = req.body;

  if(!userId) {
    next(new BusinessError(400, ErrorMsg['DATA_CHECK_ERROR']));
    return;
  }

  const result = await uploadBase64Picture(imgData);
  if(result && result.failed) {
    next(new BusinessError(500, ErrorMsg['UPLOAD_FAILED']));
    return;
  }

  const { uploadPath = '' } = result;
  const userRow = await user.update({ avatar: uploadPath }, {
    where: {
      user_id: userId,
    },
  });

  if(userRow && userRow.length) {
    await writeRequestInfo({
      params: req.headers, 
      path: '/user/change-avatar', 
      userId: userRow?.user_id, 
      status: 1,
    });
    res.json(SuccessResult({path: uploadPath}));
  } else {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
  }
});

/**
 * 更新保存基本信息
 */
apiRoutes.post('/save-base-info', async (req, res, next) => {
  const {
    userId, email, phoneNumber, nickname,
  } = req.body; 

  if(userId) {
    const updateList = await user.update({ email, phonenumber: phoneNumber, name: nickname }, {
      where: {
        user_id: userId,
      },
    });

    if(updateList && updateList.length) {
      const userRow = await user.findOne({ 
        where: { user_id: userId },
      });

      await writeRequestInfo({
        params: req.headers,
        path: '/user/save-base-info',
        userId: 1,
        status: 1,
      });
      res.json(SuccessResult(UserResult(userRow)));
    } else {
      next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
    }
  } else {
    next(new BusinessError(400, ErrorMsg['DATA_CHECK_ERROR']));
  }
});

/**
 * 修改密码
 */
apiRoutes.post('/change-password', async (req, res, next) => {
  const {
    userId, oldPwd, newPwd,
  } = req.body; 

  if(userId) {
    const userRow = await user.findOne({ 
      raw: true,
      where: { user_id: userId },
    });

    const isValid = checkPwd(oldPwd, userRow.password);
    if(!isValid) {
      next(new BusinessError(400, ErrorMsg['DATA_CHECK_ERROR']));
      return;
    }

    const updateList = await user.update({ password: getHsahPwd(newPwd) }, {
      where: {
        user_id: userId,
      },
    });

    if(updateList && updateList.length) {
      writeRequestInfo({
        params: req.headers, 
        path: '/user/change-password', 
        userId, 
        status: 1, 
        config: ErrorMsg['OPERATION_SUCCEED']
      });
      res.json(FailedResult(ErrorMsg['OPERATION_SUCCEED']));
    }
  } else {
    next(new BusinessError(400, ErrorMsg['DATA_CHECK_ERROR']));
  }
});

module.exports = apiRoutes;