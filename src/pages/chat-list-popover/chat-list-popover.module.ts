import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ChatListPopoverPage} from './chat-list-popover';

@NgModule({
  declarations: [ChatListPopoverPage],
  imports: [IonicPageModule.forChild(ChatListPopoverPage)],
  exports: [ChatListPopoverPage]
})
export class ChatListPopoverPageModule {}