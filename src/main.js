import { WechatyBuilder, log } from "wechaty";
import { onLogin, onLogout,onMessage, onScan } from "./chat/message.js";

const bot = WechatyBuilder.build({
  name: "ding-dong-bot",
  puppet: "wechaty-puppet-wechat4u",
});

const onMessageWithBot = (msg) => {
  onMessage(msg, bot)
}
bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessageWithBot);

bot
  .start()
  .then(() => log.info("StarterBot", "Starter Bot Started."))
  .catch((e) => log.error("StarterBot", e));


