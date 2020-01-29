import { Component, OnInit } from '@angular/core';
import { AuthService } from '../authentication/auth.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor(private authService: AuthService, private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.receiveAllMessages();
    
  }

  logout(){
    this.authService.logout();
  }

}
