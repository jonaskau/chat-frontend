export type WS = WSMessage | WSEvent | WSUserOnlineList | WSChatNameAndUserList

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

export interface WSUserOnlineList {
    chatId: string,
    userOnlineList: string[]
}
export function isWSUserOnlineList(ws: WS): ws is WSUserOnlineList { 
    return (ws as WSUserOnlineList).userOnlineList !== undefined
}

export interface WSChatNameAndUserList {
    chatId: string,
    chatName: string,
    users: string[]
}
export function isWSChatNameAndUserList(ws: WS): ws is WSChatNameAndUserList {
    return (ws as WSChatNameAndUserList).chatName !== undefined
}

