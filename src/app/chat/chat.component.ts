import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  addChat = false

  constructor(
    private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.startWebSocket()
  }

  toggleAddChat(value: boolean) {
    this.addChat = value
  }

}
