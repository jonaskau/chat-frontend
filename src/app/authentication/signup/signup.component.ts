import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  usernameAlreadyTaken = false;

  signUpForm = this.fb.group({
    username: ['', Validators.required, this.authService.usernameValidator.bind(this.authService)],
    password: ['', Validators.required],
    confirmPassword: ['']
  }, {validators: this.passwordConfirmValidator})

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService) { }

  ngOnInit() {
    this.authService.getUsernameAlreadyTaken().subscribe(usernameAlreadyTaken => {
      this.usernameAlreadyTaken = usernameAlreadyTaken;
    })
  }

  onSubmit() {
    this.authService.signUp(this.signUpForm.value)
  }

  passwordConfirmValidator(control: FormGroup): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password.value != confirmPassword.value ? { 'passwordNotConfirmed': true } : null;
  };
}