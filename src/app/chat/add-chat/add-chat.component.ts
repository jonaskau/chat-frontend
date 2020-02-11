import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, map, tap, filter } from 'rxjs/operators';
import { ChatService } from '../chat.service';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-add-chat',
  templateUrl: './add-chat.component.html',
  styleUrls: ['./add-chat.component.scss']
})
export class AddChatComponent implements OnInit {

  @Output() CloseAddChat: EventEmitter<boolean> = new EventEmitter();

  addChatForm = this.fb.group({
    name: ['', Validators.required],
    users: this.fb.array([])
  })
  users$: Observable<string[]>

  private searchTerms = new Subject<string>()
  private currentSearchTerm = ""

  search(term: string): void {
    this.currentSearchTerm = term
    this.searchTerms.next(term)
  }

  constructor(
    private fb: FormBuilder, 
    private chatService: ChatService,
    private authService: AuthService) { }
  
  ngOnInit() {
    this.users$ = this.searchTerms.pipe(
      /*debounceTime(0),
      distinctUntilChanged(),*/
      switchMap((term: string) => this.chatService.getUsernamesByPrefix(term)),
      map(usernames => {
        return usernames.filter(username => {
          return username !== this.authService.getUsername() && 
            !this.users.value.some(entry => entry == username)
        })
      })
    )
  }
  
  get users() {
    return this.addChatForm.get('users') as FormArray
  }

  addUser(username: string) {
    this.users.push(this.fb.control(username))
    this.searchTerms.next(this.currentSearchTerm)
  }

  removeUser(index: number) {
    this.users.removeAt(index)
    this.searchTerms.next(this.currentSearchTerm)
  }

  closeAddChat() {
    this.CloseAddChat.emit(false)
  }

  onSubmit() {
    this.CloseAddChat.emit(false)
    this.chatService.addChat(this.addChatForm.value)
  }
}
