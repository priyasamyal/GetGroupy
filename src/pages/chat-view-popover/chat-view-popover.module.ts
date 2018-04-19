import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatViewPopoverPage } from './chat-view-popover';

@NgModule({
  declarations: [
    ChatViewPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatViewPopoverPage),
  ],
  exports:[
    ChatViewPopoverPage
  ]
})
export class ChatViewPopoverPageModule {}
