import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChooseCountryPage } from './choose-country';

@NgModule({
    declarations: [
        ChooseCountryPage,
    ],
    imports: [
        IonicPageModule.forChild(ChooseCountryPage),
    ],
    exports: [
        ChooseCountryPage
    ]
})
export class ChooseCountryPageModule { }
