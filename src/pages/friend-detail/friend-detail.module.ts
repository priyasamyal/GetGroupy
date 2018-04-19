import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FriendDetailPage} from './friend-detail';

@NgModule({
  declarations: [FriendDetailPage],
  imports: [IonicPageModule.forChild(FriendDetailPage)],
  exports: [FriendDetailPage]
})
export class FriendDetailPageModule {}