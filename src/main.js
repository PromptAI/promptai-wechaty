import { WechatyBuilder, log } from "wechaty";
import { onLogin, onLogout, onMessage, onScan } from "./util/message.js";

const bot = WechatyBuilder.build({
  name: "ding-dong-bot",
  puppet: "wechaty-puppet-wechat4u",
});

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage);

bot
  .start()
  .then(() => log.info("StarterBot", "Starter Bot Started."))
  .catch((e) => log.error("StarterBot", e));
