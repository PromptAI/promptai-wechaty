const { get } = require("../utils/request");

exports.apply = async function apply() {
  return get("/chat/api/chat");
};
