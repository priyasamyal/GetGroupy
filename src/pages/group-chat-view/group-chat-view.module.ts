import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {GroupChatViewPage} from './group-chat-view';
import {EmojiPickerModule} from '@ionic-tools/emoji-picker';
import { HelloWorld} from '../../pipes/myPipe';
import { Ng2OrderModule } from 'ng2-order-pipe';

@NgModule({
  declarations: [GroupChatViewPage,HelloWorld,],
  imports: [
    IonicPageModule.forChild(GroupChatViewPage),
    EmojiPickerModule,
    Ng2OrderModule
  ],
  exports: [GroupChatViewPage]
})
export class GroupChatViewPageModule {}