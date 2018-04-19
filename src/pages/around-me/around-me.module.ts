import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AroundMePage } from './around-me';

@NgModule({
    declarations: [
        AroundMePage,
    ],
    imports: [
        IonicPageModule.forChild(AroundMePage),
    ],
    exports: [
        AroundMePage
    ]
})
export class AroundMeModule { }
