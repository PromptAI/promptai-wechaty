const { Chat } = require("./chat/core");
const config = require("./config/config");

const chat = new Chat(config);
chat.start();
