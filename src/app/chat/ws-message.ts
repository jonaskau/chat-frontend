export type WS = WSMessage | WSEvent | WSChat | WSChatAmount

export interface WSMessage {
    chatId: string,
    author: string, 
    message: string
}
export function isWSMessage(ws: WS): ws is WSMessage { 
    return (ws as WSMessage).message !== undefined
}

export interface WSEvent {
    chatId: string,
    username: string,
    userOnline: Boolean,
    userOffline: Boolean,
    userAdded: Boolean
}
export function isWSEvent(ws: WS): ws is WSEvent { 
    return (ws as WSEvent).username !== undefined
}

export interface WSChat {
    chatId: string,
    chatName: string,
    users: string[],
    userOnlineList: string[]
}
export function isWSChat(ws: WS): ws is WSChat {
    return (ws as WSChat).chatName !== undefined
}

export interface WSChatAmount {
    amount: number
}
export function isWSChatAmount(ws: WS): ws is WSChatAmount {
    return (ws as WSChatAmount).amount !== undefined
}

