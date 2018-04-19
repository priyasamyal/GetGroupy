import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {NetworkProvider} from '../../providers/network/network';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {AlertProvider} from '../../providers/alert/alert';

@IonicPage()
@Component({selector: 'page-chat-list-popover', templateUrl: 'chat-list-popover.html'})
export class ChatListPopoverPage {

  constructor(public navCtrl : NavController, public navParams : NavParams, public networkProvider : NetworkProvider, public localDb : LocalDatabaseProvider, public alertProvider : AlertProvider) {}

  ionViewWillEnter() {
    console.log('ionViewDidLoad ChatListPopoverPage');

  }

  /** navigate to user profile */
  userProfile() {

    this
      .navCtrl
      .push("UserProfilePage")

  }

}
