const { Chat } = require("./chat/core");
const config = require("../config");

const chat = new Chat(config);
chat.start();
