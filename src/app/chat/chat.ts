import { Message } from './message';

export interface Chat {
    id: string,
    name: string,
    users: Map<string, boolean>,
    messages: Message[]
}
