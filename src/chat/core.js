const { log, WechatyBuilder, ScanStatus } = require("wechaty");
const { FileBox } = require("file-box");
const qrTerm = require("qrcode-terminal");
const { apply } = require("../api/chat");
const { send } = require("../api/message");
const { decodeAttachmentText, isAttachment } = require("./message");

class Chat {
  wechaty;
  username;
  chatSession = {};
  config;
  wakeWords = [];
  static DEFAULT_FALLBACK = "换个问题试一试";
  constructor(config) {
    this.config = config;
    this.wakeWords.push(config.wakeWords);

    const wechaty = WechatyBuilder.build({
      name: "Wechaty-Prompt-AI",
      puppet: "wechaty-puppet-wechat4u",
    });
    wechaty.on("scan", this._onScan.bind(this));
    wechaty.on("login", this._onLogin.bind(this));
    wechaty.on("logout", this._onLogout.bind(this));
    wechaty.on("message", this._onMessage.bind(this));
    this.wechaty = wechaty;
  }
  start() {
    this.wechaty
      .start()
      .then(() => log.info("StarterBot", "Starter Bot Started."))
      .catch((e) => log.error("StarterBot", JSON.stringify(e)));
  }
  _isExpireSession(tallId) {
    const session = this.chatSession[tallId];
    if (!session) return true;
    const expires = session["expires"];
    if (!expires) return true;
    return Date.now() > expires;
  }
  async _initSession(tallId, messager) {
    if (this._isExpireSession(tallId)) {
      try {
        await this._initChat(tallId);
      } catch (e) {
        log.error("init session is error", JSON.stringify(e));
        await messager.say(this.config.fallback || Chat.DEFAULT_FALLBACK);
        throw new Error("[INIT SESSION] is error");
      }
    }
    return this.chatSession[tallId].chatId;
  }
  async _onScan(qrcode, status) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      qrTerm.generate(qrcode, { small: true }); // show qrcode on console
      const qrcodeImageUrl = [
        "https://wechaty.js.org/qrcode/",
        encodeURIComponent(qrcode),
      ].join("");

      log.info(
        "StarterBot",
        "onScan: %s(%s) - %s",
        ScanStatus[status],
        status,
        qrcodeImageUrl
      );
    } else {
      log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
    }
  }
  async _onLogin(user) {
    log.info("StarterBot", "%s login", user);
    this.username = user.name();
    this.wakeWords.push(this.username);
  }
  async _onLogout(user) {
    log.info("StarterBot", "%s logout", user);
    this.username = user.name();
  }
  async _onMessage(message) {
    //不处理非文本内容
    if (message.type() !== this.wechaty.Message.Type.Text) {
      return;
    }

    log.info(`StarterBot,receive message from user:${JSON.stringify(message)}`);
    let msg = message.text();
    const fromContact = message.talker();
    const toContact = message.listener();
    //非个人消息不回复
    if (fromContact?.type() !== this.wechaty.Contact.Type.Individual) {
      log.info(
        `need not reply,it's not from Individual. from contact type:${fromContact.type()}`
      );
      return;
    }

    let blnFriend = toContact?.self();
    log.info(`message from friend:${blnFriend}`);

    let talkerId = message?.payload?.talkerId;

    let blnNeedReply = blnFriend || false;
    const wakeword = this.wakeWords.find((w) => msg.includes(w));
    if (wakeword) {
      msg = msg.replace(wakeword, "");
      blnNeedReply = true;
    }
    log.info(`blnFriend: ${blnFriend},blnNeedReply:${blnNeedReply}`);

    if (blnNeedReply) {
      const chatId = await this._initSession(talkerId, message);
      log.info(`send msg to chat:'${talkerId}: [${chatId}] -> message:${msg} `);
      const reply = await send(chatId, msg, msg);
      log.info(`msg reply from bot:${JSON.stringify(reply)}`);
      await this._processMessage(reply, message);
    }
  }
  async _initChat(talkerId) {
    const { id: chatId } = await apply();
    this.chatSession[talkerId] = {
      chatId: chatId,
      expires: Date.now() + (this.config.expireTime || 300 * 1000),
    };
    await send(chatId, "/init", "/init");
  }

  async _processMessage(reply, message) {
    const answers =
      reply.answers?.length > 0
        ? reply.answers.filter((m) => !m.custom)
        : [{ text: FALLBACK }];

    log.info(`'bot answers:'${JSON.stringify(answers)}`);
    for (let i = 0; i < answers.length; i++) {
      let item = answers[i];
      //1. 处理按钮回复 暂时忽略
      if (item?.buttons?.length > 0) {
      }

      //2. 处理图片回复
      if (item.image) {
        log.info(`image url:${getBaseUrl() + item.image}`);
        const fileBox = FileBox.fromUrl(
          getBaseUrl() + item.image,
          `${item.image + ".jpeg"}`
        );
        //发送图片
        await message.say(fileBox);
      }

      //3. 处理文件回复
      if (isAttachment(item.text)) {
        let files = decodeAttachmentText(item.text);
        log.info(`file url: ${getBaseUrl() + files.href}`);
        const fileBox = FileBox.fromUrl(getBaseUrl() + files.href, files.name);
        //发送图片
        await message.say(fileBox);
        return;
      }
      //4. 处理文本回复
      if (item.text) {
        await message.say(item.text);
      }
    }
  }
}

function singleton(className) {
  let instance = null;
  return new Proxy(className, {
    construct: (target, args) => {
      if (!instance) {
        instance = new target(...args);
      }
      return instance;
    },
  });
}
const instance = singleton(Chat);
module.exports = {
  Chat: instance,
};
