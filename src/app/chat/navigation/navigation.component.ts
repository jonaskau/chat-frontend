import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Chat } from '../chat';
import { AuthService } from 'src/app/authentication/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  chats: Chat[];
  selectedChatId: String;

  constructor(
    private authService: AuthService, 
    private chatService: ChatService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.chats = this.chatService.getChats();
    this.selectedChatId = this.route.snapshot.paramMap.get('id')
  }

  logout(){
    this.authService.logout()
    this.chatService.removeAllMessagesAndCloseWebSocket()
  }
}
