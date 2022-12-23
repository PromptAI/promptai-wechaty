import {apply} from '../api/chat.js'
import {send} from '../api/message.js'


export async function applyChat() {
    let data = await apply();
    return data?.id;
}

export async function sendMsg(chatId, content, message) {
    return await send(chatId,content,message)
}




