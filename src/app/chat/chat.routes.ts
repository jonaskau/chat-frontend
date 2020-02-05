import { Routes } from '@angular/router';
import { AddChatComponent } from './add-chat/add-chat.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { EditChatComponent } from './edit-chat/edit-chat.component';
import { MessageComponent } from './message/message.component';

export const ChatRoutes: Routes = [
    { path: '', component: WelcomeComponent},
    { path: 'add', component: AddChatComponent},
    { path: ':id', component: MessageComponent},
    { path: ':id/edit', component: EditChatComponent}
]