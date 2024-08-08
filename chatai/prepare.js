const { path } = require('path');
const { AlibabaTongyiEmbeddings } = require('@langchain/community/embeddings/alibaba_tongyi');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
// const { GithubRepoLoader } = require('@langchain/community/document_loaders/web/github');
const { DirectoryLoader } = require('langchain/document_loaders/fs/directory');

/**
 * 文本就是切割，并保存在本地的数据库文件中
 */
const run = async () => {

  const loader = new DirectoryLoader(
    path?.join(__dirname, "../data/blog"),
    {
      ".mdx": (path) => new TextLoader(path),
    }
  );

  // const loader = new GithubRepoLoader(
  //   'https://github.com/qingxiang1/blog-site-template',
  //   {
  //     branch: 'main',
  //     recursive: true,
  //     unknown: 'warn',
  //     ignorePaths: [
  //       '*.md', 'yarn.lock', '*.json', '*.js', '*.ts', '*.tsx', '*.jsx', '*.html', '*.css', '*.yml', '*.png',
  //       '*.svg', '*.jpg', '*.jpeg', '*.ico', '.bib', '.mjs',
  //     ],
  //     accessToken: '',
  //   },
  // );
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  const embeddings = new AlibabaTongyiEmbeddings({
    apiKey: 'sk-9a17bca62f2045f6887f69bb5086cc30',
    modelName: 'text-embedding-v1',
  });
  const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);

  await vectorStore.save(path?.join(__dirname, './db/github'));
};

run();
