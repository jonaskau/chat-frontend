import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  showChat = false

  private showNavigationOrChatSubscription: Subscription

  constructor(
    private chatService: ChatService) { }

  ngOnInit() {
    this.showNavigationOrChatSubscription = 
    this.chatService.getShowNavigationOrChatBehaviorSubject().subscribe(value => {
      this.showChat = !value
    })
  }
  
  ngOnDestroy(): void {
    this.showNavigationOrChatSubscription.unsubscribe()
  }

  openNavigation() {
    this.chatService.getShowNavigationOrChatBehaviorSubject().next(true)
  }
}
