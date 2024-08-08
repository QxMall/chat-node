const path = require('path');
const fs = require('fs');

const { getProfile, getBase64File } = require('./utils');
const { dirExists } = require('./fileOperation');
const Constants = require('../common/constants');

/**
 * 获取文件存储的路径
 */
const getUploadPath = (uploadDir, fileName) => {
  const dirLastIndex = getProfile().length + 1;
  const currentDir = uploadDir.substring(dirLastIndex);
  return `${Constants.RESOURCE_PREFIX}/${currentDir}/${fileName}`;
};

/**
 * 按日期存储文件
 * @returns 
 */
const getSavePath = () => {
  const date = new Date();
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 图片上传工具类
 */
const uploadBase64Picture = async (imgData) => {
  // 获取 base64 文件数据
  const { dataBuffer, fileName } = getBase64File(imgData);

  const timeFileDir = getSavePath();

  // 获取存储位置
  const basePath = path.join(getProfile(), `./upload/images/${timeFileDir}`);

  // 判断目录是否存在 不存在则创建目录
  await dirExists(basePath);

  const savePath = `${basePath}/${fileName}`; // 文件上传路径
  const uploadPath = getUploadPath(basePath, fileName); // 数据库存储路径

  // 存储上传文件
  const error = fs.writeFileSync(savePath, dataBuffer);
  if (error) {
    return { failed: true };
  } 
  return {
    failed: false,
    uploadPath,
  };
};

module.exports = {
  uploadBase64Picture,
};