import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ChatService } from '../chat.service';
import { Chat } from '../chat';
import { AuthService } from 'src/app/authentication/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  @Output() OpenAddChat: EventEmitter<boolean> = new EventEmitter();

  chats: Chat[]
  selectedChatId: string = ""

  private currentChatSubscription: Subscription

  constructor(
    private authService: AuthService, 
    private chatService: ChatService) { }

  ngOnInit() {
    this.chats = this.chatService.getChats()
    this.currentChatSubscription = this.chatService.getCurrentChatIdBehaviorSubject().subscribe(id => {
      this.selectedChatId = id
    })
  }

  ngOnDestroy(): void {
    this.currentChatSubscription.unsubscribe()
  }

  openAddChat() {
    this.OpenAddChat.emit(true);
  }

  logout(){
    this.authService.logout()
    this.chatService.removeAllMessagesAndCloseWebSocket()
  }
}
