import { Injectable } from '@angular/core';
import { Backend } from '../backend';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chat } from './chat';
import { IncomingMessage } from './incoming-message';
import { Message } from './message';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket' 
import { AuthService } from '../authentication/auth.service';
import { IncomingWSMessage } from './incoming-ws-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends Backend {

  private chats: Chat[];
  private messageWebSocketSubject: WebSocketSubject<IncomingWSMessage>;

  constructor(
    private http: HttpClient, 
    private authService: AuthService) { 
    super()
  }

  getChats(): Chat[] {
    return this.chats;
  }

  receiveAllMessagesAndStartWebSocket() {
    const url = `${this.Url}message`
    this.http.get<IncomingMessage[]>(url)
      .pipe(
        catchError(this.handleError<IncomingMessage[]>(<IncomingMessage[]>[]))
      ).subscribe(incomingMessages => {
        this.chats = <Chat[]>[]
        incomingMessages.forEach(incomingMessage => {
          let found = false;
          let message: Message = {
            date: incomingMessage.date, 
            author: incomingMessage.author,
            message: incomingMessage.message 
          }
          this.chats.forEach(chat => {
            if(chat.id == incomingMessage.chatId) {
              chat.messages.push(message)
              found = true
            }
          })
          if (!found) {
            this.chats.push({
              id: incomingMessage.chatId,
              name: incomingMessage.chatName,
              messages: [message]
            })
          }
        });
        this.startWebSocket();
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

  private addMessage(wsMessage: IncomingWSMessage) {
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
          messages: [message]
        })
      })
    }
  }

  private getChatNameById(id: String): Observable<{chatName: String}> {
    const url = `${this.Url}chat/getChatNameById/${id}`
    return this.http.get<{chatName: String}>(url).pipe(
      catchError(this.handleError<{chatName: String}>({chatName: 'name could not be loaded'}))
    )
  }

  private getUsernamesByPrefix(usernamePrefix: string): Observable<string[]> {
    const url = `${this.Url}user/getUsernamesByPrefix/${usernamePrefix}`
    return this.http.get<string[]>(url).pipe(
      catchError(this.handleError<string[]>([]))
    )
  }
}
