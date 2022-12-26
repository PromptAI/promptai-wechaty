import {get, post, del} from '../utils/request.js';

export async function send(chatId,content,message) {
    return post('/chat/api/message', {chatId, content, message});
}