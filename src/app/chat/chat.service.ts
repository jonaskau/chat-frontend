import { Injectable } from '@angular/core';
import { Backend } from '../backend';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chat } from './chat';
import { IncomingMessage } from './incoming-message';
import { Message } from './message';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends Backend{

  chats: Chat[] = <Chat[]>[];

  constructor(private http: HttpClient, private router: Router) { 
    super()
  }

  getChats(): Chat[] {
    return this.chats;
  }

  private getUsernamesByPrefix(usernamePrefix: string): Observable<string[]> {
    const url = `${this.Url}user/getUsernamesByPrefix/${usernamePrefix}`;
    return this.http.get<string[]>(url)
      .pipe(
        catchError(this.handleError<string[]>([]))
      )
  }

  receiveAllMessages() {
    const url = `${this.Url}message`;
    this.http.get<IncomingMessage[]>(url)
      .pipe(
        catchError(this.handleError<IncomingMessage[]>(<IncomingMessage[]>[]))
      ).subscribe(incomingMessages => {
        this.chats = <Chat[]>[];
        incomingMessages.forEach(incomingMessage => {
          let found = false;
          let message: Message = {
            date: incomingMessage.date, 
            author: incomingMessage.author,
            message: incomingMessage.message 
          }
          this.chats.forEach(chat => {
            if(chat.id == incomingMessage.chatId) {
              chat.messages.push(message);
              found = true;
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
      })
  }


}
