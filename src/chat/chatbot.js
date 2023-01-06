const { apply } = require("../api/chat");
const { send } = require("../api/message");

exports.applyChat = async function applyChat() {
  let data = await apply();
  return data?.id;
};

exports.sendMsg = async function sendMsg(chatId, content, message) {
  return await send(chatId, content, message);
};
