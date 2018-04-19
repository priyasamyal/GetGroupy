import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {MapModalPage} from './map-modal';

@NgModule({
  declarations: [MapModalPage],
  imports: [IonicPageModule.forChild(MapModalPage)],
  exports: [MapModalPage]
})
export class MapModalPageModule {}