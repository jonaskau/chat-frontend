import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ChatGuard } from './authentication/chat.guard';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthGuard } from './authentication/auth.guard';
import { ChatRoutes } from './chat/chat.routes';


const routes: Routes = [
  { path: "", redirectTo: '/chat', pathMatch: 'full'},
  { path: "chat", component: ChatComponent, children: ChatRoutes, canActivate: [ChatGuard]},
  { path: "authenticate", component: AuthenticationComponent, canActivate: [AuthGuard]},
  { path: "**", redirectTo: '/chat', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ChatGuard, AuthGuard]
})
export class AppRoutingModule { }
