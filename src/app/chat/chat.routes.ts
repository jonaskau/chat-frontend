import { Routes } from '@angular/router';
import { AddChatComponent } from './add-chat/add-chat.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ChatComponent } from './chat.component';
import { EditChatComponent } from './edit-chat/edit-chat.component';

export const ChatRoutes: Routes = [
    { path: '', component: WelcomeComponent},
    { path: 'add', component: AddChatComponent},
    { path: ':id', component: ChatComponent},
    { path: ':id/edit', component: EditChatComponent}
]