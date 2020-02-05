import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Chat } from '../chat';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  chat: Chat = {id: "", name: "", users: [], messages: []}

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    const chatId = this.route.snapshot.paramMap.get('id')
    this.chatService.getChatsReceivedBehaviorSubject().subscribe(chatsReceived => {
      if (chatsReceived) {
        this.chatService.getCurrentChatIdBehaviorSubject().subscribe(id => {
          const chat = this.chatService.getChat(id)
          if (chat == null) {
            this.router.navigate(['/'])
          }
          this.chat = chat
        })
      }
    })

    this.chatService.getCurrentChatIdBehaviorSubject().next(chatId)
  }

}
