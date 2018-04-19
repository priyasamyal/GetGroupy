import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

import {AlertProvider} from '../../providers/alert/alert';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';
import {NetworkProvider} from '../../providers/network/network';
import {GroupProvider} from '../../providers/group/group';

@IonicPage()
@Component({selector: 'page-invisible-popover', templateUrl: 'invisible-popover.html'})
export class InvisiblePopoverPage {
  is_visible : any;
  showInvisible : boolean = false;
  showVisible : boolean = false;

  constructor(public navCtrl : NavController, public navParams : NavParams, public viewCtrl : ViewController, public apiProvider : ApiProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public localDb : LocalDatabaseProvider, public alertProvider : AlertProvider, public groupProvider : GroupProvider) {
    console.log("data", this.navParams.get('data'));

    this.is_visible = this
      .navParams
      .get('data');
    if (this.is_visible == '1') {
      this.showInvisible = true;
    } else {
      this.showVisible = true;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InvisiblePopoverPage');
  }

  /** set invisible/ visible user */
  setInvisible(status) {
    let requestParams = {
      group_id: this
        .navParams
        .get('group_id'),
      user_id: this.phoneNumberRegisterProvider.user_id,
      is_visible: status
    }
    this
      .groupProvider
      .SetVisibleInvisible(requestParams)
      .subscribe(data => {
        //console.log(data);
        this
          .viewCtrl
          .dismiss(data);
        if (status == '1') {
          this
            .alertProvider
            .showAlert('You have set yourself visible')
        } else {
          this
            .alertProvider
            .showAlert('You have set yourself invisible')
        }

      }, err => {
        console.log(err);
        this
          .alertProvider
          .showAlert('Server is not responding')
      })
  }

}
