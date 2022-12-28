import {ScanStatus, log} from "wechaty";
import qrTerm from "qrcode-terminal";
import {applyChat, sendMsg} from "./chatbot.js"
import {FileBox} from 'file-box'
import {getBaseUrl} from '../utils/request.js'

let username
let chatSession = {}
const FALLBACK = '换个问题试一试'
const CHAT_ID_EXPIRE_SPAN = 300 //chat 默认过期时间:秒
let CALL_BOT_CONFIG = ['@智能客服', '@薛辉', '@谷白', '智能客服', '薛辉', '谷白', "小Z", "小维", 'cc', 'CC']

export async function onScan(qrcode, status) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        qrTerm.generate(qrcode, {small: true}); // show qrcode on console

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

export async function onLogin(user) {
    log.info("StarterBot", "%s login", user);
    username = user.name()
    CALL_BOT_CONFIG.push(username)

}

export async function onLogout(user) {
    log.info("StarterBot", "%s logout", user);
    username = user.name()
}

export async function onMessage(message, bot) {

    //不处理非文本内容
    if (message.type() !== bot.Message.Type.Text) {
        return
    }

    log.info(`StarterBot,receive message from user:${JSON.stringify(message)}`,);
    let msg = message.text()
    const fromContact = message.talker()
    const toContact = message.listener()
    //非个人消息不回复
    if (fromContact?.type() !== bot.Contact.Type.Individual) {
        log.info(`need not reply,it's not from Individual. from contact type:${fromContact.type()}`)
        return
    }

    let blnFriend = toContact?.self()
    log.info(`message from friend:${blnFriend}`,);

    let talkerId = message?.payload?.talkerId

    let blnNeedReply = blnFriend || false
    for (let i = 0; i < CALL_BOT_CONFIG.length; i++) {
        if (msg.indexOf(CALL_BOT_CONFIG[i]) !== -1) {
            msg = msg.replace(CALL_BOT_CONFIG[i], '')
            blnNeedReply = true
            break
        }

    }
    log.info(`blnFriend: ${blnFriend},blnNeedReply:${blnNeedReply}`)
    // 1. 会话初始化
    if (blnNeedReply && chatSession[talkerId] === undefined) {
        let blnInitChat = await initChat(talkerId, message, bot)
        if (!blnInitChat) {
            return await message.say(FALLBACK)
        }
    }
    let chat = chatSession[talkerId]
    // 2. chat是否过期
    if (chatExpires(chat)) {
        let blnInitChat = await initChat(talkerId, message, bot)
        if (!blnInitChat) {
            return await message.say(FALLBACK)
        }
    }
    let chatId = chatSession[talkerId]['chatId']
    log.info(`talkerId:${talkerId}, chatId:${chatId}`)

    // 3. 处理发送的消息
    if (blnNeedReply && chatId !== undefined) {
        log.info(`send msg to chat:'${talkerId},message:${msg} `)
        let reply = await sendMsg(chatId, msg, msg);
        log.info(`msg reply from bot:${JSON.stringify(reply)}`)
        await processMessage(reply, message, bot)
    }
}

export async function initChat(talkerId, message, bot) {
    let chatId = await applyChat();
    let now = Date.parse(new Date())
    chatSession[talkerId] = {
        chatId: chatId,
        expires: now + CHAT_ID_EXPIRE_SPAN,
    };
    let reply = await sendMsg(chatId, '/init', '/init');
    if (reply) {
        log.info('init chat success!')
        return true
    } else {
        log.info('init chat failed!')
        return false
    }
}


export function decodeAttachmentText(value) {
    try {
        return JSON.parse(decodeURIComponent(value));
    } catch (e) {
        //
    }
    return {name: '-', href: '#', type: 'null', version: '0.0.1'};
}

export function encodeAttachmentText(value) {
    return encodeURIComponent(JSON.stringify(value));
}

// %7B%22name%22%3A%22trash.png.svg%22%2C%22type%22%3A%22svg%22%2C%22href%22%3A%22%2Fapi%2Fblobs%2Fget%2Fa1_c4fjhb1rer5s%22%2C%22version%22%3A%220.0.1%22%7D
export function isAttachment(value) {
    if (!value) return false;
    if (value.startsWith('%7B%22') && value.endsWith('%22%7D')) return true;
    return false;
}

export async function processMessage(reply, message, bot) {
    const answers =
        reply.answers?.length > 0
            ? reply.answers.filter((m) => !m.custom)
            : [{text: FALLBACK}];

    log.info(`'bot answers:'${JSON.stringify(answers)}`)
    for (let i = 0; i < answers.length; i++) {
        let item = answers[i]
        //1. 处理按钮回复 暂时忽略
        if (item?.buttons?.length > 0) {

        }

        //2. 处理图片回复
        if (item.image) {
            log.info(`image url:${getBaseUrl() + item.image}`)
            const fileBox = FileBox.fromUrl(getBaseUrl() + item.image, `${item.image + '.jpeg'}`)
            //发送图片
            await message.say(fileBox)
        }

        //3. 处理文件回复
        if (isAttachment(item.text)) {
            let files = decodeAttachmentText(item.text)
            log.info(`file url: ${getBaseUrl() + files.href}`)
            const fileBox = FileBox.fromUrl(getBaseUrl() + files.href, files.name)
            //发送图片
            await message.say(fileBox)
            return
        }
        //4. 处理文本回复
        if (item.text) {
            await message.say(item.text);
        }
    }
}

export function chatExpires(chat) {
    if (chat === undefined || chat['expires'] === undefined) {
        return true
    }
    let expires = chat['expires']
    let now = Date.parse(new Date())
    if (now < expires) {
        return false
    }
    return true
}

export function needReply(msg) {

    for (let i = 0; i < CALL_BOT_CONFIG.length; i++) {
        if (msg.indexOf(CALL_BOT_CONFIG[i]) !== -1) {
            msg = msg.replace(CALL_BOT_CONFIG[i], '')
            log.info(`msg replaced: ${msg}`)
            return true
        }

    }
    return false
}