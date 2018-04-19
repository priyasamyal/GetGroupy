import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ChatViewPage} from './chat-view';
import {EmojiPickerModule} from '@ionic-tools/emoji-picker';
import {VirtualScrollModule} from 'angular2-virtual-scroll';
import {NgxAutoScrollModule} from "ngx-auto-scroll";

@NgModule({
    declarations: [ChatViewPage],
    imports: [
        IonicPageModule.forChild(ChatViewPage),
        EmojiPickerModule,
        NgxAutoScrollModule,
        VirtualScrollModule
    ],
    exports: [ChatViewPage]
})
export class ChatViewPageModule {}