const OpenAI = require('openai')
require('dotenv/config');

const getDeepSeek = async(message = '', modelStr = '', temperature = 1, ...rest) => {

  let modelName = 'deepseek-chat';
  if(modelStr === 'deepseek-coder') {
    modelName = 'deepseek-coder';
  }

  const model = new OpenAI({
    apiKey: process.env.DEEP_SEEK_API_KEY,
    baseURL: process.env.DEEP_SEEK_BASE_URL,
  });

  const result = await model.chat.completions.create({
    model: modelName,
    temperature,
    messages: [{ role: 'user', content: message }],
    ...rest,
  });

  return result?.choices[0].message?.content ?? '';
};

module.exports = {
  getDeepSeek,
};

// const run = async() => {
//   const message = await getDeepSeek('你是谁?');

//   console.log('chat msg :', message);
// };

// run();