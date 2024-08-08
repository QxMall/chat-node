const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { AlibabaTongyiEmbeddings } = require('@langchain/community/embeddings/alibaba_tongyi');
const { ChatAlibabaTongyi } = require('@langchain/community/chat_models/alibaba_tongyi');
require('dotenv/config');
const path = require('path');
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts');
const {
  RunnableSequence,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { JSONChatHistory } = require('./JSONChatHistory/index');

/**
 * 根据重写后的独立问题去读取数据库中的相关文档
 */
async function loadVectorStore() {
  const directory = path.join(__dirname, './db/github');
  const embeddings = new AlibabaTongyiEmbeddings({
    // @ts-ignore
    modelName: 'text-embedding-v1',
  });
  const vectorStore = await FaissStore.load(directory, embeddings);

  return vectorStore;
}

async function getRephraseChain() {
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
    new ChatAlibabaTongyi({
      model: 'qwen-turbo', // qwen1.5-0.5b-chat
      temperature: 0.4,
    }),
    new StringOutputParser(),
  ]);

  return rephraseChain;
}

async function getRagChain() {
  const vectorStore = await loadVectorStore();
  const retriever = vectorStore.asRetriever(2);

  /**
   * 使用 retriever 获取相关文档，然后转换成纯字符串。
   * @returns
   */
  const convertDocsToString = (documents) => {
    return documents.map((document) => document.pageContent).join('\n');
  };

  const contextRetrieverChain = RunnableSequence.from([
    (input) => input.standalone_question,
    retriever,
    convertDocsToString,
  ]);

  const SYSTEM_TEMPLATE = `
    你是一个熟读原文的终极原着党，精通根据原文详细解释和回答问题，你在回答时会引用原文。
    并且回答时仅根据原文信息，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

    以下是原文中跟用户回答相关的内容：
    {context}
  `;

  /**
   * 包含历史记录信息的 prompt
   */
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_TEMPLATE],
    new MessagesPlaceholder('history'),
    ['human', '现在，你需要基于原文，回答以下问题：\n{standalone_question}`'],
  ]);

  const model = new ChatAlibabaTongyi({
    model: 'qwen-turbo',
  });
  const rephraseChain = await getRephraseChain();

  /**
   * 改写提问 => 根据改写后的提问获取文档 => 生成回复 的 rag chain
   */
  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      standalone_question: rephraseChain,
    }),
    RunnablePassthrough.assign({
      context: contextRetrieverChain,
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
  getRagChain,
  getRephraseChain,
  loadVectorStore,
};

// const run = async () => {
//   const ragChain = await getRagChain();
//   const result = await ragChain.stream(
//     {
//       question: '请基于原文回答，什么是球形闪电',
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
