import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateGroupSecondStepPage } from './create-group-second-step';

@NgModule({
    declarations: [
        CreateGroupSecondStepPage,
    ],
    imports: [
        IonicPageModule.forChild(CreateGroupSecondStepPage),
    ],
    exports: [
        CreateGroupSecondStepPage
    ]
})
export class CreateGroupSecondStepPageModule { }
