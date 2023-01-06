module.exports = {
  baseURL: "https://app.promptai.cn",
  id: "change_me",
  project: "change_me",
  token: "change_me",
  // 这里是唤醒词，可以自定义多个；
  // 用户可 @扫码用户、或者在一句话的开头使用下面唤醒词的任意一个即可与AI对话
  // 比如： 小维，今天天气怎么样？
  wakeWords:["小维",  "@智能客服", "小Z", ],
  // 出现错误时的回复，可选配置
  fallback: "换个问题试一试"
};
