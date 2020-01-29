import { Message } from './message';

export interface Chat {
    id: String,
    name: String,
    messages: Message[]
}
