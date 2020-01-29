import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient} from '@angular/common/http';
import { Observable, of, Subject} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from './user';
import { Backend } from '../backend';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends Backend{

  private token = "";
  private isAuthenticated = false;
  private isAuthenticatedSubject = new Subject<boolean>();
  private usernameAlreadyTaken = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { 
    super()
  }

  getToken() {
    return this.token;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getIsAuthenticatedObservable() {
    return this.isAuthenticatedSubject as Observable<boolean>;
  }

  getUsernameAlreadyTaken() {
    return this.usernameAlreadyTaken as Observable<boolean>;
  }

  usernameValidator (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.http.get<{available: Boolean}>(`${this.Url}user/usernameAvailable/${control.value}`).pipe(
      tap(usernameAvailable => usernameAvailable.available ? this.usernameAlreadyTaken.next(false) : this.usernameAlreadyTaken.next(true)),
      map(usernameAvailable => (usernameAvailable.available ? null : {usernameNotAvailable: true})),
      catchError(this.handleError<ValidationErrors>({databaseError: true}))
    )
  }

  signUp(user: User) {
    this.authenticate(user, "signup");
  }

  signIn(user: User) {
    this.authenticate(user, "login");
  }

  private authenticate(user: User, signInOrUp: string) {
    this.http.post<{token: string, expiresIn: number}>(`${this.Url}user/${signInOrUp}`, user).pipe(
      catchError(this.handleAuthenticationError())
    ).subscribe(authData => {
      if (authData == null) {
        return;
      }
      this.token = authData.token;
      this.isAuthenticated = true;
      setTimeout(() => {
        this.logout();
      }, authData.expiresIn * 60000)
      this.setAuthData(this.token, Date.now() + 3600000);
      this.router.navigate(['/'])
    });
  }

  private handleAuthenticationError () {
    return (error: any): Observable<{token: string, expiresIn: number}> => {
      console.log(error);
      this.isAuthenticatedSubject.next(false);
      return of(null);
    }
  }

  logout() {
    this.token = "";
    this.isAuthenticated = false;
    this.removeAuthData();
    this.router.navigate(['/authenticate'])
  }

  autoSignIn() {
    const authData = this.getAuthData();
    if (authData.token == null || authData.expiresAt == null) {
      return;
    }
    const timeUnitlLogout = +authData.expiresAt - Date.now();
    if (timeUnitlLogout > 0 ) {
      this.token = authData.token;
      this.isAuthenticated = true;
    }
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expiresAt");
    return {token, expiresAt}
  }

  private setAuthData(token: string, expiresAt: number) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiresAt", expiresAt.toString());
  }

  private removeAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");
  }
}