import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './authentication/signup/signup.component';
import { SigninComponent } from './authentication/signin/signin.component';
import { NavigationComponent } from './chat/navigation/navigation.component';
import { ChatComponent } from './chat/chat.component';
import { AuthInterceptor } from './authentication/auth-interceptor';
import { AuthenticationComponent } from './authentication/authentication.component';
import { MessageComponent } from './chat/message/message.component';
import { AddChatComponent } from './chat/add-chat/add-chat.component';
import { EditChatComponent } from './chat/edit-chat/edit-chat.component';
import { WelcomeComponent } from './chat/welcome/welcome.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    SigninComponent,
    NavigationComponent,
    ChatComponent,
    AuthenticationComponent,
    MessageComponent,
    AddChatComponent,
    EditChatComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
