import { Injectable } from '@angular/core';
import { Backend } from '../backend';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chat } from './chat';
import { Message } from './message';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket' 
import { AuthService } from '../authentication/auth.service';
import { WSMessage, WS, isWSMessage, isWSEvent, isWSUserOnlineList, isWSChatNameAndUserList} from './ws-message';
import { IncomingChat } from './incoming-chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends Backend {

  private chats = <Chat[]>[]
  private messageWebSocketSubject: WebSocketSubject<WS> = null
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
          onlineUsers: <string[]>[],
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
      ws => {
        if(isWSMessage(ws)) {
          this.addMessage(ws)
        } else if (isWSChatNameAndUserList(ws)) { //passiert bevor der users in dem chat online ist und nachrichten erhalten kann
          this.chats.push({
            id: ws.chatId,
            name: ws.chatName,
            onlineUsers: [],
            users: ws.users,
            messages: []
          })
        } else if (isWSUserOnlineList(ws)) { //passiert immer bevor der User online geht
          let found = false;
          this.chats.forEach(chat => {
            if(chat.id == ws.chatId) {
              chat.onlineUsers = ws.userOnlineList
              found = true
            }
          })
          if (!found) {         //passiert falls chat erstellt wurde, nachdem ich alle chats erhalten habe
            let chat: Chat = {  //aber bevor die ws-Verbindung eröffnet wurde
              id: ws.chatId,  
              name: "",
              onlineUsers: ws.userOnlineList,
              users: [],
              messages: []
            }
            this.chats.push(chat)
            this.getChatById(ws.chatId).subscribe(result => {
              chat.name = result.name
              chat.users = result.users
            })
          }
        } else if (isWSEvent(ws)) {
          this.chats.forEach(chat => {
            if (chat.id == ws.chatId) {
              if (ws.userOnline) {
                chat.onlineUsers.push(ws.username)
                chat.messages.push({
                  author: "System",
                  date: Date.now(),
                  message: `${ws.username} online`
                })
              } else if (ws.userOffline) {
                chat.onlineUsers = chat.onlineUsers.filter(username => username !== ws.username)
                chat.messages.push({
                  author: "System",
                  date: Date.now(),
                  message: `${ws.username} offline`
                })
              } else {
                chat.users.push(ws.username)
                chat.messages.push({
                  author: "System",
                  date: Date.now(),
                  message: `${ws.username} added`
                })
              }
            }
          })
        }
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
    let message: Message = {
      author: wsMessage.author,
      date: Date.now(),
      message: wsMessage.message
    }
    this.chats.forEach(chat => {
      if(chat.id == wsMessage.chatId) {
        chat.messages.push(message)
      }
    })
  }

  private getChatById(id: string): Observable<{id: string, name: string, users: string[]}> {
    const url = `${this.Url}chats/${id}`
    return this.http.get<{id: string, name: string, users: string[]}>(url).pipe(
      catchError(this.handleError<{id: string, name: string, users: string[]}>({id: "", name: "", users: <string[]>[]}))
    )
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
