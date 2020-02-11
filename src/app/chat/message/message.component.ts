import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { ChatService } from '../chat.service';
import { Chat } from '../chat';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messageList', {static: false}) private messageList: ElementRef
  
  chat: Chat = {id: "", name: "", users: [], messages: []}
  username = ""
  scrollDown = false
  
  private chatsReceivedSubscribtion: Subscription
  private scrollMessageListSubscribtion: Subscription

  messageForm = this.fb.group({
    messageInput: ["", Validators.required]
  })
  
  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) { }
    
  ngOnInit() {
    this.username = this.authService.getUsername()

    this.scrollMessageListSubscribtion = 
    this.chatService.getScrollMessageListObservable().subscribe(scrollDown => {
      this.scrollDown = scrollDown
    })  

    this.chatsReceivedSubscribtion = 
    this.chatService.getChatsReceivedBehaviorSubject().subscribe(chatsReceived => {
      if (chatsReceived) {
        this.route.paramMap.pipe(
          switchMap(params => {
            const id = params.get('id')
            const chat = this.chatService.getChat(id)
            if (chat == null) {
              this.router.navigate(['/'])
            }
            this.chat = chat
            this.chatService.getCurrentChatIdBehaviorSubject().next(id)
            return id
          })
        ).subscribe()
      }
    })
  }
  
  ngAfterViewChecked(): void {
    if (this.scrollDown) {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight
      this.scrollDown = false
    }
  }

  ngOnDestroy(): void {
    this.scrollMessageListSubscribtion.unsubscribe()
    this.chatsReceivedSubscribtion.unsubscribe()
  }

  sendMessage(): void {
    this.chatService.sendMessageToWebSocket(this.chat.id, this.messageForm.value.messageInput)
    this.messageForm.reset()
  }

  loadMore(): void {
    this.scrollDown = false
    const lastDate = this.chat.messages[0].date
    this.chatService.receiveMessagesFromDB(this.chat, 5, lastDate)
  }
}