const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression'); // 压缩
const helmet = require('helmet'); // 安全插件
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('dotenv/config');

const logger = require('./utils/logger');
const apiRoutes = require('./api');
const checkToken = require('./utils/checkToken');
const { writeRequestInfo } = require('./utils/utils'); // getProfile, 

const app = express();
const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat Node API',
      version: '0.0.1',
      description: '提供对接阿里千问、百度文心、DeepSeek等大模型的接口',
    },
    servers: [
      {
        url: 'https://api.qxmall.store',
      },
    ],
  },
  // 指定 swaggerDefinition.js 文件路径
  apis: ['./api/*.js'], // 更改为你的路由文件
};

const specs = swaggerJsDoc(options);

app.use(cors({
  // origin: ['*'],
  credentials: true,
}));
app.use(express.static(path.join(`${process.env.PROFILE_PATH}`, '')));
app.use(helmet());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(cookieParser());
app.use(compression());
app.use(require('express-domain-middleware'));

// 以 api 开头的路由添加token校验
app.use('/api', checkToken);
apiRoutes(app);

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 统一错误处理
// eslint-disable-next-line no-unused-vars
app.use(async (error, req, res, next) => {
  const reqUrl = req?.url ?? '';
  const realUrl = reqUrl ? reqUrl.split('?')[0] : reqUrl;
  const userId = req?.query?.userId || req?.body?.userId || '';

  logger.error(`error global ${req.method} ${realUrl} ${JSON.stringify(req.body)}`);
  logger.error(`error global ${JSON.stringify(error.message || error.msg)}`);

  if (error) {
    await writeRequestInfo({
      params: req.headers, 
      path: realUrl, 
      userId,
      status: 0, 
      config: {
        msg: error.message || error.msg || '系统错误',
      },
    });
    
    res.status(error.httpCode || 500).json({
      msg: error.message || error.msg || '系统错误', 
      code: error.code || '000001',
    });
  }
});

app.listen(port, () => {
  console.log('server start on port', port);
});