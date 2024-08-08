# chat-node

#### 介绍
node API 后端

#### 软件架构
基于 express、sequelize、mysql2 实现的 nodejs 后端，提供认证相关接口、日志相关接口、文件上传下载、chat ai 等相关接口的调用


#### 使用教程

##### 1.  安装依赖
```js
    pnpm install
```

##### 2.  配置数据库
    在 common/config.js 中配置数据库相关信息

##### 3.  同步数据库
    在 model 文件夹下创建数据表模型，创建完成后，打开 model/index.js 文件内注释掉的代码

```js
    sequelize.sync({ force: true }); // 同步所有表模型
```

    终端内执行如下命令，同步到数据库
```js
    node ./model/index.js
```
    
    同步完成后，注释掉 *sequelize.sync* 相关代码，避免重复同步

##### 4.  启动项目
```js
    pnpm dev
```

