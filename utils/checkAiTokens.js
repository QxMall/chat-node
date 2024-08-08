const { tokenInfo } = require('../model/index');


const changeTokens = async(userId, token) => {
  try {
    const userRow = await tokenInfo.findOne({
      raw: true,
      where: {
        user_id: userId,
      },
    });

    const { tokens } = userRow;

    await tokenInfo.update(
      { tokens: parseInt(Math.floor(tokens - token)) },
      {
        where: {
          user_id: userId
        }
      }
    );
    return 'success';
  } catch (error) {
    return '000001';
  }
};

/**
 * 验证用户 token 数
 */
const checkAiTokens = async (userId, token = 0) => {
  try {
    const userRow = await tokenInfo.findOne({
      raw: true,
      where: {
        user_id: userId,
      },
    });

    if (!userRow) {
      return '000002';
    }

    const { tokens } = userRow;

    if (tokens <= 0) {
      return '000009';
    } else {

      await tokenInfo.update(
        { tokens: parseInt(Math.floor(tokens - token)) },
        {
          where: {
            user_id: userId
          }
        }
      );

      return 'success';
    }
  } catch (err) {
    return '000001';
  }
};

module.exports = {
  checkAiTokens,
  changeTokens,
}