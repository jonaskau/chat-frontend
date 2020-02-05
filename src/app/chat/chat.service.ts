import { Injectable } from '@angular/core';
import { Backend } from '../backend';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Chat } from './chat';
import { Message } from './message';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket' 
import { AuthService } from '../authentication/auth.service';
import { WSMessage } from './ws-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends Backend {

  private chats = <Chat[]>[]
  private messageWebSocketSubject: WebSocketSubject<WSMessage> = null
  private chatsReceivedBehaviorSubject = new BehaviorSubject<boolean>(false)
  private currentChatIdBehaviorSubject = new BehaviorSubject<string>("")

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

  removeAllMessagesAndCloseWebSocket(): void {
    this.chats = <Chat[]>[]
    this.messageWebSocketSubject.complete()
    this.messageWebSocketSubject = null
    this.chatsReceivedBehaviorSubject.next(false)
  }

  receiveChatsAndStartWebSocket() {
    if (this.messageWebSocketSubject != null) {
      return
    }
    const url = `${this.Url}chats`
    this.http.get<Chat[]>(url).pipe(
      catchError(this.handleError<Chat[]>(<Chat[]>[]))
    ).subscribe(chats => {
      chats.forEach(chat => {
        this.chats.push(chat)
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
      date: Date.now(),
      author: wsMessage.author,
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

  private getUsernamesByPrefix(usernamePrefix: string): Observable<string[]> {
    const url = `${this.Url}users/getUsernamesByPrefix/${usernamePrefix}`
    return this.http.get<string[]>(url).pipe(
      catchError(this.handleError<string[]>([]))
    )
  }
}
