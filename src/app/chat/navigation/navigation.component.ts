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
  showNavigation = false

  private currentChatSubscription: Subscription
  private showNavigationOrChatSubscription: Subscription

  constructor(
    private authService: AuthService, 
    private chatService: ChatService) { }

  ngOnInit() {
    this.chats = this.chatService.getChats()
    this.currentChatSubscription = this.chatService.getCurrentChatIdBehaviorSubject().subscribe(id => {
      this.selectedChatId = id
    })
    
    this.showNavigationOrChatSubscription = 
    this.chatService.getShowNavigationOrChatBehaviorSubject().subscribe(value => {
      this.showNavigation = value
    })
  }

  ngOnDestroy(): void {
    this.currentChatSubscription.unsubscribe()
    this.showNavigationOrChatSubscription.unsubscribe()
  }

  openAddChat() {
    this.OpenAddChat.emit(true)
  }

  closeNavigation() {
    this.chatService.getShowNavigationOrChatBehaviorSubject().next(false)
  }

  logout(){
    this.authService.logout()
    this.chatService.removeAllMessagesAndCloseWebSocket()
  }
}
