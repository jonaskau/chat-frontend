import { Message } from './message';

export interface Chat {
    id: string,
    name: string,
    users: string[],
    onlineUsers: string[],
    messages: Message[]
}
