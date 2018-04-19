import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {InvisiblePopoverPage} from './invisible-popover';

@NgModule({
  declarations: [InvisiblePopoverPage],
  imports: [IonicPageModule.forChild(InvisiblePopoverPage)],
  exports: [InvisiblePopoverPage]
})
export class InvisiblePopoverPageModule {}