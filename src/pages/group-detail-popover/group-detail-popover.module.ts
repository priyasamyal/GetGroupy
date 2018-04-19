import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {GroupDetailPopoverPage} from './group-detail-popover';

@NgModule({
    declarations: [GroupDetailPopoverPage],
    imports: [IonicPageModule.forChild(GroupDetailPopoverPage)],
    exports: [GroupDetailPopoverPage]
})
export class GroupDetailPopoverPageModule {}