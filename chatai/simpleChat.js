const { ChatAlibabaTongyi } = require('@langchain/community/chat_models/alibaba_tongyi');
// const { ChatBaiduQianfan } = require('@langchain/baidu-qianfan');
const { ChatBaiduWenxin } = require("@langchain/community/chat_models/baiduwenxin");
const {
  RunnableSequence,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} = require('@langchain/core/runnables');
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { JSONChatHistory } = require('./JSONChatHistory/index');
require('dotenv/config');
const path = require('path');
const ApiModelMap = require('../common/aiModelMap');

async function getRephraseChain(promoteModel) {

  const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      '给定以下对话和一个后续问题，请将后续问题重述为一个独立的问题。请注意，重述的问题应该包含足够的信息，使得没有看过对话历史的人也能理解。',
    ],
    new MessagesPlaceholder('history'),
    ['human', '将以下问题重述为一个独立的问题：\n{question}'],
  ]);

  const rephraseChain = RunnableSequence.from([
    rephraseChainPrompt,
    promoteModel,
    new StringOutputParser(),
  ]);

  return rephraseChain;
}

/**
 * 直连模型
 * @param {*} params 
 * @returns 
 */
async function getSimpleChain(params = {}) {

  const {
    modelName = '',
    temperature = 0.2,
    streaming = true,
    ...rest
  } = params;

  let model;
  let promoteModel;



  if(modelName?.includes('qwen')) { // 千问模型
    model = new ChatAlibabaTongyi({
      model: ApiModelMap['modelName'] || 'qwen-long',
      temperature,
      ...rest,
    });

    promoteModel = new ChatAlibabaTongyi({
      model: 'qwen-long',
      temperature: 0.2,
    });

  } else { 
    // 百度千帆模型
    model = new ChatBaiduWenxin({
      // ERNIE-Lite-8K、ERNIE-Lite-8K-0922、ERNIE-Tiny-8K、ERNIE-Speed-128K、ERNIE-Speed-8K、ERNIE Speed-AppBuilder
      model: ApiModelMap['modelName'] || 'ERNIE-Lite-8K', 
      temperature,
      streaming,
      ...rest,
    });

    promoteModel = new ChatBaiduWenxin({
      model: 'ERNIE-Speed-8K',
      temperature: 0.2,
    });
  }

  /**
   * 包含历史记录信息的 prompt
   */
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', '你是一个知识渊博的人，根据你所知道的知识，尽可能回答用户问题'],
    new MessagesPlaceholder('history'),
    ['human', '现在，你需要回答以下问题：\n{standalone_question}`'],
  ]);

  const rephraseChain = await getRephraseChain(promoteModel);

  /**
   * 改写提问 => 根据改写后的提问获取文档 => 生成回复 的 rag chain
   */
  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      standalone_question: rephraseChain,
    }),
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const chatHistoryDir = path.join(__dirname, './chat_data');

  /**
   * 使用 RunnableWithMessageHistory 去管理 history，给 chain 增加聊天记录的功能
   * 传给 getMessageHistory 的函数，需要根据用户传入的 sessionId 去获取初始的 chat history
   */
  const ragChainWithHistory = new RunnableWithMessageHistory({
    runnable: ragChain,
    getMessageHistory: (sessionId) => new JSONChatHistory({ sessionId, dir: chatHistoryDir }),
    historyMessagesKey: 'history',
    inputMessagesKey: 'question',
  });

  return ragChainWithHistory;
}

module.exports = {
  getSimpleChain,
};

// const run = async () => {
//   const ragChain = await getSimpleChain();
//   const result = await ragChain.stream(
//     {
//       question: '什么是球形闪电',
//     },
//     { configurable: { sessionId: 'test-model' } }
//   );

//   let msg = '';

//   for await (const chunk of result) {
//     msg += chunk.toString();
//   }

//   console.log('chat msg :', result, msg);
// };

// run();