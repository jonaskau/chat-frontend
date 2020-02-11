import { Injectable } from '@angular/core';
import { Backend } from '../backend';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chat } from './chat';
import { Message } from './message';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket' 
import { AuthService } from '../authentication/auth.service';
import { WSMessage } from './ws-message';
import { IncomingChat } from './incoming-chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends Backend {

  private chats = <Chat[]>[]
  private messageWebSocketSubject: WebSocketSubject<WSMessage> = null
  private chatsReceivedBehaviorSubject = new BehaviorSubject<boolean>(false)
  private currentChatIdBehaviorSubject = new BehaviorSubject<string>("")
  private scrollMessageListSubject = new BehaviorSubject<boolean>(false)

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

  receiveChatsAndStartWebSocket() {
    if (this.messageWebSocketSubject != null) {
      return
    }
    const url = `${this.Url}chats`
    this.http.get<IncomingChat[]>(url).pipe(
      catchError(this.handleError<IncomingChat[]>(<IncomingChat[]>[]))
    ).subscribe(chats => {
      chats.forEach(chat => {
        this.chats.push({
          id: chat.id,
          name: chat.name,
          users: chat.users,
          messages: <Message[]>[]
        })
      })
      this.chatsReceivedBehaviorSubject.next(true)
      this.startWebSocket()
    })
  }

  private startWebSocket() {
    this.messageWebSocketSubject = webSocket({
      url: this.wsUrl,
      protocol: this.authService.getToken()
    });
    this.messageWebSocketSubject.subscribe (
      message => {
        this.addMessage(message)
        this.scrollMessageListSubject.next(true)
      },
      error => {
        console.log(error)
      },
      () => {
        console.log('complete')
      }
    )
  }

  private addMessage(wsMessage: WSMessage) {
    let found = false;
    let message: Message = {
      author: wsMessage.author,
      date: Date.now(),
      message: wsMessage.message
    }
    this.chats.forEach(chat => {
      if(chat.id == wsMessage.chatId) {
        chat.messages.push(message)
        found = true
      }
    })
    if (!found) {
      this.getChatNameById(wsMessage.chatId).subscribe(result => {
        this.chats.push({
          id: wsMessage.chatId,
          name: result.chatName,
          users: [],
          messages: [message]
        })
      })
    }
  }

  private getChatNameById(id: string): Observable<{chatName: string}> {
    const url = `${this.Url}chats/getChatNameById/${id}`
    return this.http.get<{chatName: string}>(url).pipe(
      catchError(this.handleError<{chatName: string}>({chatName: 'name could not be loaded'}))
    )
  }

  addChat(addChat: {name: string, users: string[]}) {
    const url = `${this.Url}chats`
    this.http.post(url, addChat).pipe(
      catchError(this.handleError<{}>(null))
    ).subscribe()
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
