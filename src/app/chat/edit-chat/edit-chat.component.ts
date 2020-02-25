import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { ChatService } from '../chat.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { switchMap, map } from 'rxjs/operators';
import { Chat } from '../chat';

@Component({
  selector: 'app-edit-chat',
  templateUrl: './edit-chat.component.html',
  styleUrls: ['./edit-chat.component.scss']
})
export class EditChatComponent implements OnInit {

  @Output() CloseEditChat: EventEmitter<boolean> = new EventEmitter();
  @Input() chat: Chat;

  editChatForm = this.fb.group({
    chatId: ["", Validators.required],
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
    this.editChatForm.get('chatId').setValue(this.chat.id)
    this.users$ = this.searchTerms.pipe(
      switchMap((term: string) => this.chatService.getUsernamesByPrefix(term)),
      map(usernames => {
        return usernames.filter(username => {
          return username !== this.authService.getUsername() && 
            !this.users.value.some(entry => entry == username) &&
            !this.chat.users.has(username)
        })
      })
    )
  }

  get users() {
    return this.editChatForm.get('users') as FormArray
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
    this.CloseEditChat.emit(false)
  }

  onSubmit() {
    this.CloseEditChat.emit(false)
    this.chatService.editChat(this.editChatForm.value).subscribe()
  }
}
