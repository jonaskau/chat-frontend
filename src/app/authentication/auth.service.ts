import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient} from '@angular/common/http';
import { Observable, of, Subject} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from './user';
import { Backend } from '../backend';
import { Router } from '@angular/router';
import { AuthData } from './auth-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends Backend{

  private token = ""
  private username = ""
  private isAuthenticated = false
  private isAuthenticatedSubject = new Subject<boolean>()
  private usernameAlreadyTaken = new Subject<boolean>()

  constructor(
    private http: HttpClient, 
    private router: Router) { 
    super()
  }

  getToken() {
    return this.token
  }

  getUsername() {
    return this.username
  }

  getIsAuthenticated() {
    return this.isAuthenticated
  }

  getIsAuthenticatedObservable() {
    return this.isAuthenticatedSubject as Observable<boolean>
  }

  getUsernameAlreadyTaken() {
    return this.usernameAlreadyTaken as Observable<boolean>
  }

  usernameValidator (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.http.get<{available: Boolean}>(`${this.Url}users/usernameAvailable/${control.value}`).pipe(
      tap(usernameAvailable => usernameAvailable.available ? this.usernameAlreadyTaken.next(false) : this.usernameAlreadyTaken.next(true)),
      map(usernameAvailable => (usernameAvailable.available ? null : {usernameNotAvailable: true})),
      catchError(this.handleError<ValidationErrors>({databaseError: true}))
    )
  }

  signUp(user: User) {
    this.authenticate(user, "signup")
  }

  signIn(user: User) {
    this.authenticate(user, "login")
  }

  private authenticate(user: User, signInOrUp: string) {
    this.http.post<AuthData>(`${this.Url}users/${signInOrUp}`, user).pipe(
      catchError(this.handleAuthenticationError())
    ).subscribe(authData => {
      if (authData == null) {
        return
      }
      this.token = authData.token
      this.username = authData.username
      this.isAuthenticated = true
      setTimeout(() => {
        this.logout()
      }, authData.expiresIn * 60000)
      this.setAuthData(this.token, this.username, Date.now() + 3600000)
      this.router.navigate(['/'])
    })
  }

  private handleAuthenticationError () {
    return (error: any): Observable<AuthData> => {
      console.log(error)
      this.isAuthenticatedSubject.next(false)
      return of(null)
    }
  }

  logout() {
    this.token = ""
    this.username = ""
    this.isAuthenticated = false
    this.removeAuthData()
    this.router.navigate(['/authenticate'])
  }

  autoSignIn() {
    const authData = this.getAuthData()
    if (authData.token == null || authData.username == null || authData.expiresAt == null) {
      return
    }
    const timeUnitlLogout = +authData.expiresAt - Date.now()
    if (timeUnitlLogout > 0 ) {
      this.token = authData.token
      this.username = authData.username
      this.isAuthenticated = true
    }
  }

  private getAuthData() {
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")
    const expiresAt = localStorage.getItem("expiresAt")
    return {token, username, expiresAt}
  }

  private setAuthData(token: string, username: string, expiresAt: number) {
    localStorage.setItem("token", token)
    localStorage.setItem("username", username)
    localStorage.setItem("expiresAt", expiresAt.toString())
  }

  private removeAuthData() {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("expiresAt")
  }
}