/**
 * Chat AI 模块
 */

const express = require('express');
const BusinessError = require('../common/BusinessError');
const ErrorMsg = require('../common/errorMsg');
const { writeRequestInfo, calculatingTokens } = require('../utils/utils');
const { getRagChain } = require('../chatai/chat');
const { getSimpleChain } = require('../chatai/simpleChat');
const { getDeepSeek } = require('../chatai/deepSeek');
const { SuccessResult } = require('../result/Result.js');
const { checkAiTokens, changeTokens } = require('../utils/checkAiTokens');
const logger = require('../utils/logger.js');

const apiRoutes = express.Router();

/**
 * @swagger
 * /api/chat/get-answer:
 *   get:
 *     tags:
 *       - 登录
 *     summary: 基于私域内容检索回答
 *     description:
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户 ID
 *                 example: b719790e-090f-4a1b-8de7-de2f9ed79aeb
 *               message:
 *                 type: string
 *                 description: 对话内容
 *                 example: 你是谁？能帮我干什么？
 *               sessionId:
 *                 type: string
 *                 description: 对应于用户本次对话的唯一标识，用于记录历史
 *                 example: 
 *      
 *     responses:
 *       200:
 *         description: 查询成功，返回ai对话内容
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
 *                   type: string
 */
apiRoutes.post('/get-answer', async (req, res, next) => {
  const ragChain = await getRagChain();
  const { userId, message, sessionId } = req.body;

  if(!message || !sessionId || !userId) {
    next(new BusinessError(400, ErrorMsg['REQ_PARAM_ERROR']));
    return;
  }

  const askTokens = calculatingTokens(message);
  const checkMsg = await checkAiTokens(userId, askTokens);

  if(checkMsg === '000002') {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
    return;
  } else if(checkMsg === '000009') {
    next(new BusinessError(500, ErrorMsg['BALANCE_EXHAUSTED_ERROR']));
    return;
  } else if(checkMsg !== 'success') {
    next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
    return;
  }

  const result = await ragChain.stream(
    {
      question: message,
    },
    { configurable: { sessionId: sessionId } }
  );

  let answer = '';
  for await (const chunk of result) {
    answer += chunk;
  }

  // 减 tokens
  const ansTokens = calculatingTokens(answer);
  const msg = await changeTokens(userId, ansTokens);

  if(msg !== 'success') {
    next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
    return;
  }

  await writeRequestInfo({
    params: req.headers, 
    path: '/chat/get-answer', 
    userId, 
    status: 1, 
    reqMsg: message,
    respMsg: answer,
  });
  res.json(SuccessResult(answer));
});


/**
 * @swagger
 * /api/chat/direct-connect-model:
 *   get:
 *     tags:
 *       - 登录
 *     summary: 直连 千问、文心大模型
 *     description:
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户 ID
 *                 example: b719790e-090f-4a1b-8de7-de2f9ed79aeb
 *               message:
 *                 type: string
 *                 description: 对话内容
 *                 example: 你是谁？能帮我干什么？
 *               sessionId:
 *                 type: string
 *                 description: 对应于用户本次对话的唯一标识，用于记录历史
 *                 example: 
 *               modelName:
 *                 type: string
 *                 description: 模型名
 *                 example: ERNIE-Speed-128K、ERNIE-Speed-8K、ERNIE-Lite-8K、ERNIE-Lite-8K-0922、ERNIE-Tiny-8K、baichuan-7b-v1、llama2-13b-chat-v2、llama2-7b-chat-v2、qwen-1.8b-chat
 *               temperature:
 *                 type: number
 *                 description: 采样温度，介于 0 和 2 之间。更高的值，如 0.8，会使输出更随机，而更低的值，如 0.2，会使其更加集中和确定
 *                 example: 1.0
 * 
 *     responses:
 *       200:
 *         description: 查询成功，返回ai对话内容
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
 *                   type: string
 */
apiRoutes.post('/direct-connect-model', async (req, res, next) => {

  const { userId, message, sessionId, modelName, ...rest } = req.body;

  const ragChain = await getSimpleChain({
    modelName,
    ...rest
  });

  if(!message || !sessionId || !userId) {
    next(new BusinessError(400, ErrorMsg['REQ_PARAM_ERROR']));
    return;
  }

  const askTokens = calculatingTokens(message);
  const checkMsg = await checkAiTokens(userId, askTokens);

  if(checkMsg === '000002') {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
    return;
  } else if(checkMsg === '000009') {
    next(new BusinessError(500, ErrorMsg['BALANCE_EXHAUSTED_ERROR']));
    return;
  } else if(checkMsg !== 'success') {
    next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
    return;
  }

  const result = await ragChain.stream(
    {
      question: message,
    },
    { configurable: { sessionId: sessionId } }
  );

  let answer = '';
  for await (const chunk of result) {
    answer += chunk;
  }

  // 减 tokens
  const ansTokens = calculatingTokens(answer);
  const msg = await changeTokens(userId, ansTokens);

  if(msg !== 'success') {
    next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
    return;
  }

  await writeRequestInfo({
    params: req.headers, 
    path: '/chat/direct-connect-model', 
    userId, 
    status: 1, 
    reqMsg: message,
    respMsg: answer,
    config: {
      msg: modelName || '',
    }
  });
  res.json(SuccessResult(answer));
});

/**
 * @swagger
 * /api/chat/connect-deep-seek:
 *   get:
 *     tags:
 *       - 登录
 *     summary: 直连 DeepSeek 大模型
 *     description:
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户 ID
 *                 example: b719790e-090f-4a1b-8de7-de2f9ed79aeb
 *               message:
 *                 type: string
 *                 description: 对话内容
 *                 example: 你是谁？能帮我干什么？ 
 *               modelName:
 *                 type: string
 *                 description: 模型名
 *                 example: deepseek-chat、deepseek-coder
 *               temperature:
 *                 type: number
 *                 description: 采样温度，介于 0 和 2 之间。更高的值，如 0.8，会使输出更随机，而更低的值，如 0.2，会使其更加集中和确定
 *                 example: 1.0
 * 
 *     responses:
 *       200:
 *         description: 查询成功，返回ai对话内容
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
 *                   type: string
 */
apiRoutes.post('/connect-deep-seek', async (req, res, next) => {

  const { userId, message, modelName = '', temperature = 1 } = req.body;

  if(!message || !userId) {
    next(new BusinessError(400, ErrorMsg['REQ_PARAM_ERROR']));
    return;
  }

  const askTokens = calculatingTokens(message);
  const checkMsg = await checkAiTokens(userId, askTokens);

  if(checkMsg === '000002') {
    next(new BusinessError(500, ErrorMsg['NO_SUCH_USER_INFO']));
    return;
  } else if(checkMsg === '000009') {
    next(new BusinessError(500, ErrorMsg['BALANCE_EXHAUSTED_ERROR']));
    return;
  } else if(checkMsg !== 'success') {
    next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
    return;
  }

  const answer = await getDeepSeek(message, modelName, temperature);

  // 减 tokens
  const ansTokens = calculatingTokens(answer);
  const msg = await changeTokens(userId, ansTokens);

  if(msg !== 'success') {
    next(new BusinessError(500, ErrorMsg['SERVER_ERROR']));
    return;
  }
  
  await writeRequestInfo({
    params: req.headers, 
    path: '/chat/connect-deep-seek', 
    userId, 
    status: 1, 
    reqMsg: message,
    respMsg: answer,
    config: {
      msg: '',
    }
  });
  res.json(SuccessResult(answer));
});


module.exports = apiRoutes;
