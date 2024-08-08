const fs = require('fs');
const path = require('path');

/**
 * 读取路径信息
 * @param {string} filepath 路径
 */
const getStat = (filePath) => {
  return new Promise((resolve) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats);
      }
    });
  });
};

/**
 * 创建路径
 * @param {string} pathName 路径
 */
const mkdir = (pathName) => {
  // const lastPath = pathName.substring(0, pathName.lastIndexOf('/'));
  return new Promise((resolve) => {
    fs.mkdir(pathName, { recursive: true }, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
const dirExists = async (dir) => {
  const isExists = await getStat(dir);

  // 如果该路径且不是文件，返回true
  if(isExists) {
    // @ts-ignore
    if(isExists?.isDirectory()) {
      return true;
    }
    // 如果该路径存在但是文件，返回false
    return false;
  }

  const tempDir = path.parse(dir).dir; // 拿到上级路径
  // 如果上级目录也不存在，递归，直到目录存在
  const status = await dirExists(tempDir);
  let mkdirStatus;
  if(status) {
    mkdirStatus = await mkdir(dir);
  }
  return mkdirStatus;
};

module.exports = {
  mkdir,
  getStat,
  dirExists,
};
