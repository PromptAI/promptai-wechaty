import { get, post, del } from '../utils/request.js';

export async function apply() {
    return get('/chat/api/chat');
}
