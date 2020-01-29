import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ChatGuard } from './chat/chat.guard';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthGuard } from './authentication/auth.guard';


const routes: Routes = [
  { path: "", component: ChatComponent, canActivate: [ChatGuard]},
  { path: "authenticate", component: AuthenticationComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ChatGuard, AuthGuard]
})
export class AppRoutingModule { }
