import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CaptionImagePage} from './caption-image';

@NgModule({
  declarations: [CaptionImagePage],
  imports: [IonicPageModule.forChild(CaptionImagePage)],
  exports: [CaptionImagePage]
})
export class CaptionImagePageModule {}