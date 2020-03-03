import { Component, OnInit, HostListener } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  wrongCredentials = false
  showSignUpLink = false

  signInForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService) { }

  ngOnInit() {
    this.onResize()
    this.authService.getIsAuthenticatedObservable().subscribe(isAuth => {
      this.wrongCredentials = !isAuth
      setTimeout(() => {
        this.wrongCredentials = false
      }, 2000)
    })
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth <= 500) {
      this.showSignUpLink = true
    } else {
      this.showSignUpLink = false
    }
  }

  scrollToSignUp() {
    window.scrollTo({top: window.innerHeight, left: 0, behavior: 'smooth'})
  }

  onSubmit() {
    this.authService.signIn(this.signInForm.value)
  }
}
