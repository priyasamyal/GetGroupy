import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupEditPage } from './group-edit';

@NgModule({
  declarations: [
    GroupEditPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupEditPage),
  ],
  exports: [
    GroupEditPage
  ]
})
export class GroupEditPageModule { }
