const Redis = require("ioredis");

const redis = new Redis({
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  username: "",
  password: "",
});

/**
 * 设置 redis
 * @param {*} key 
 * @param {*} value 
 * @param {*} timeLang 
 * @returns 
 */
const setRedis = async (key, value, timeLang = 60 * 60 * 12) => {
  return await redis.set(key, value, "EX", timeLang); // 有效期 12 小时
};

/**
 * 获取 redis 值
 * @param {*} key 
 * @returns 
 */
const getRedis = async (key) => {
  return await redis.get(key);
};

module.exports = {
  redis,
  setRedis,
  getRedis,
};
