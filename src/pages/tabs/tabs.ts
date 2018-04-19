import {Component, ChangeDetectorRef} from '@angular/core';
import {IonicPage, NavController, NavParams, Events} from 'ionic-angular';

import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';

@IonicPage()
@Component({templateUrl: 'tabs.html'})
export class TabsPage {
  mySelectedIndex : any = 0;

  tab1Root = "ChatListPage";
  tab2Root = "WorldGroupsPage";
  tab3Root = "MyGroupsPage";
  tab4Root = "AroundMePage";
  tab5Root = "ContactsPage";
  group_badge : any;
  chat_badge : any;
  constructor(public navParams : NavParams, public detectorRef : ChangeDetectorRef, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public event : Events) {
    this.mySelectedIndex = this
      .navParams
      .get('tabIndex');

    this
      .event
      .subscribe('groupbadge:updated', _badgeValue => {
        console.log("event subscribe.", _badgeValue);
        this.group_badge = _badgeValue;
        this
          .detectorRef
          .detectChanges();
      });

    this
      .event
      .subscribe('chatbadge:updated', _badgeValue => {
        console.log("event subscribe.", _badgeValue);
        this.chat_badge = _badgeValue;
        this
          .detectorRef
          .detectChanges();
      });
  }
}
