import { Injectable } from '@angular/core';
import { Backend } from '../backend';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chat } from './chat';
import { Message } from './message';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket' 
import { AuthService } from '../authentication/auth.service';
import { WSMessage, WS, isWSMessage, isWSEvent, isWSChat, isWSChatAmount, WSEvent, WSChat} from './ws-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends Backend {

  private chats = <Chat[]>[]
  private messageWebSocketSubject: WebSocketSubject<WS> = null
  private chatsReceivedBehaviorSubject = new BehaviorSubject<boolean>(false)
  private currentChatIdBehaviorSubject = new BehaviorSubject<string>("")
  private scrollMessageListSubject = new BehaviorSubject<boolean>(false)
  private showNavigationOrChatBehaviorSubject = new BehaviorSubject<boolean>(true)
  private chatRoomAmountAtBeginning: number

  constructor(
    private http: HttpClient, 
    private authService: AuthService) { 
    super()
  }

  getChats(): Chat[] {
    return this.chats
  }

  getChat(id: string): Chat {
    const filteredChats = this.chats.filter(chat => chat.id === id)
    if (filteredChats.length == 1) {
      return filteredChats[0]
    }
    return null  
  }

  getChatsReceivedBehaviorSubject() {
    return this.chatsReceivedBehaviorSubject
  }

  getCurrentChatIdBehaviorSubject(): Subject<string> {
    return this.currentChatIdBehaviorSubject
  }

  getShowNavigationOrChatBehaviorSubject() {
    return this.showNavigationOrChatBehaviorSubject
  }

  getScrollMessageListObservable(): Observable<any> {
    return this.scrollMessageListSubject.asObservable()
  }

  sendMessageToWebSocket(chatId: string, message: string): void {
    this.messageWebSocketSubject.next({
      chatId: chatId,
      author: this.authService.getUsername(),
      message: message
    })
  }

  receiveMessagesFromDB(chat: Chat, amount: number, olderThanDate: number): void {
    const url = `${this.Url}messages/getBatch`
    const getMessagesData = {
      chatId: chat.id,
      amount: amount,
      olderThanDate: olderThanDate
    }
    this.http.post<Message[]>(url, getMessagesData).pipe(
      catchError(this.handleError<Message[]>(<Message[]>[]))
    ).subscribe(messages => {
      messages.forEach(message => {
        chat.messages.unshift(message)
      })
    })
  }

  removeAllMessagesAndCloseWebSocket(): void {
    this.chats = <Chat[]>[]
    this.messageWebSocketSubject.complete()
    this.messageWebSocketSubject = null
    this.chatsReceivedBehaviorSubject.next(false)
    this.currentChatIdBehaviorSubject.next("")
  }

  startWebSocket() {
    this.messageWebSocketSubject = webSocket({
      url: this.wsUrl,
      protocol: this.authService.getToken()
    });
    this.messageWebSocketSubject.subscribe (
      ws => {
        if(isWSMessage(ws)) {
          this.addWSMessage(ws)
        } else if (isWSChatAmount(ws)) {
          this.chatRoomAmountAtBeginning = ws.amount
        } else if (isWSChat(ws)) {
          this.addWSChat(ws)
        } else if (isWSEvent(ws)) {
          this.processWSEvent(ws)
        }
      },
      error => {
        console.log(error)
      },
      () => {
        console.log('complete')
      }
    )
  }
  
  private addWSMessage(wsMessage: WSMessage) {
    let message: Message = {
      author: wsMessage.author,
      date: Date.now(),
      message: wsMessage.message
    }
    for(let i = 0; i < this.chats.length; i++) {
      if (this.chats[i].id == wsMessage.chatId) {
        this.chats[i].messages.push(message)
        this.scrollMessageListSubject.next(true)
        break
      }
    }
  }

  private addWSChat(wsChat: WSChat) {
    let users = new Map<string, boolean>()
    wsChat.users.forEach(user => {
      users.set(user, false)
    })
    wsChat.userOnlineList.forEach(user => {
      users.set(user, true)
    })

    this.chats.push({
      id: wsChat.chatId,
      name: wsChat.chatName,
      users: users,
      messages: []
    })
    if (this.chats.length >= this.chatRoomAmountAtBeginning) {
      this.chatsReceivedBehaviorSubject.next(true)
    }
  }

  private processWSEvent(wsEvent: WSEvent) {
    let message: Message = {
      author: 'System',
      date: Date.now(),
      message: wsEvent.username
    }
    for(let i = 0; i < this.chats.length; i++) {
      if (this.chats[i].id == wsEvent.chatId) {
        if (wsEvent.userOnline) {
          this.chats[i].users.set(wsEvent.username, true)
          message.message += ' online'
        } else if (wsEvent.userOffline) {
          this.chats[i].users.set(wsEvent.username, false)
          message.message += ' offline'
        } else {
          this.chats[i].users.set(wsEvent.username, false)
          message.message += ' added'
        }
        this.chats[i].messages.push(message)
        this.scrollMessageListSubject.next(true)
        break
      }
    }
  }

  addChat(addChat: {name: string, users: string[]}) {
    const url = `${this.Url}chats`
    this.http.post(url, addChat).pipe(
      catchError(this.handleError<{}>(null))
    ).subscribe()
  }

  editChat(editChat: {chatId: string, users: string[]}) {
    const url = `${this.Url}chats/addUsers`
    return this.http.put<string[]>(url, editChat).pipe(
      catchError(this.handleError<string[]>(<string[]>[]))
    )
  }

  getUsernamesByPrefix(usernamePrefix: string): Observable<string[]> {
    if (usernamePrefix == "") {
      return of(<string[]>[])
    }
    const url = `${this.Url}users/getUsernamesByPrefix/${usernamePrefix}`
    return this.http.get<string[]>(url).pipe(
      catchError(this.handleError<string[]>([]))
    )
  }
}
