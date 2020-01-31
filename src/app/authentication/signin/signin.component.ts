import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  wrongCredentials = false;

  signInForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService) { }

  ngOnInit() {
    this.authService.getIsAuthenticatedObservable().subscribe(isAuth => {
      this.wrongCredentials = !isAuth;
      setTimeout(() => {
        this.wrongCredentials = false;
      }, 2000)
    })
  }

  onSubmit() {
    this.authService.signIn(this.signInForm.value)
  }
}
