import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Chat } from '../chat';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  chats: Chat[];
  constructor(private authService: AuthService, private chatService: ChatService) { }

  ngOnInit() {
    this.chats = this.chatService.getChats();
  }

  logout(){
    this.authService.logout();
  }
}
