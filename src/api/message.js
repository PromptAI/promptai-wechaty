const { post } = require("../utils/request");

exports.send = async function send(chatId, content, message) {
  return post("/chat/api/message", { chatId, content, message });
};
