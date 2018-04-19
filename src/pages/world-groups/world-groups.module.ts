import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorldGroupsPage } from './world-groups';

@NgModule({
  declarations: [
    WorldGroupsPage,
  ],
  imports: [
    IonicPageModule.forChild(WorldGroupsPage),
  ],
  exports: [
    WorldGroupsPage
  ]
})
export class WorldGroupsPageModule { }
