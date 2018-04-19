import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {ApiProvider} from '../../providers/api/api';

@IonicPage()
@Component({selector: 'page-chat-view-popover', templateUrl: 'chat-view-popover.html'})
export class ChatViewPopoverPage {

  constructor(public navCtrl : NavController, public navParams : NavParams, public localDb : LocalDatabaseProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public apiProvider : ApiProvider,) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatViewPopoverPage');
  }

  /** set invisible  status  */
  setInvisible() {
    let obj = {
      id: this.phoneNumberRegisterProvider.user_id,
      is_online: 2,
      last_seen: new Date()
    }
    this
      .apiProvider
      .socket
      .emit('online_offline_status', obj);
    this
      .localDb
      .popover
      .dismiss();
  }
}
