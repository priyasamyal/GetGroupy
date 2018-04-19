import {Component} from '@angular/core';
import {NavController, NavParams, MenuController, IonicPage} from 'ionic-angular';

//import { CreateGroupPage } from '../create-group/create-group';

import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {GroupProvider} from '../../providers/group/group';
import {NetworkProvider} from '../../providers/network/network';
import {AlertProvider} from '../../providers/alert/alert';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';

@IonicPage()
@Component({selector: 'page-world-groups', templateUrl: 'world-groups.html'})
export class WorldGroupsPage {
  searchGroupArray : any = [];
  searchQuerry : string;
  imgUrl : string;
  showOfflineImage : boolean;
  groupIds = [];
  groupMembers : any = [];
  searchQuery : '';
  constructor(public navCtrl : NavController, public navParams : NavParams, public menuController : MenuController, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public groupProvider : GroupProvider, public networkProvider : NetworkProvider, public alertProvider : AlertProvider, public localDb : LocalDatabaseProvider, public apiProvider : ApiProvider) {
    this
      .menuController
      .enable(true, 'nav');
    this.imgUrl = this.apiProvider.imageUrl;
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad PrivateGroupsPage');
    if (this.networkProvider.isOffline()) {
      this.localDb.worldGroups = [];
      this
        .localDb
        .getWorldGroups()
        .then(data => {
          this.showOfflineImage = true;
          console.log('getWorldGroups', data);
        }, err => {
          console.log('error', err);
        });
    } else {

      this.showOfflineImage = false;
      this.groupIds = [];
      this.getWorldGroups();
      this.getPublicGroups();
      this.getPrivateGroups();
    }
  }

  /**navigate to Create group */
  creatGroup() {
    this
      .navCtrl
      .push("CreateGroupSecondStepPage", {
        user_id: this.phoneNumberRegisterProvider.user_id,
        my_groupIds: this.groupIds
      })
  }

  /** get all world groups */
  getWorldGroups() {
    if (this.networkProvider.isOffline()) {
      this
        .alertProvider
        .showAlert('No internet');
    } else {
      this
        .groupProvider
        .getWorldGroups()
        .subscribe(data => {
          this.localDb.worldGroups = data.data;
          console.log(this.localDb.worldGroups);
          this.searchGroupArray = this.localDb.worldGroups;
          console.log(this.localDb.worldGroups);
          if (this.localDb.worldGroups.length == 0) {
            this.localDb.noWorldGroups = true;
          } else {
            this.localDb.noWorldGroups = false;
          }
          this
            .localDb
            .saveWorldGroups(this.localDb.worldGroups)
            .then(data => {});
        }, err => {
          this
            .alertProvider
            .showAlert('Server not responding'); // show from local database
        });
    }
  }

  /** search groups */
  searchGroups(ev) {
    let val = ev.target.value;
    this.searchQuerry = ev.target.value;
    if (val && val.trim() != '') {
      this.localDb.worldGroups = this
        .searchGroupArray
        .filter(item => {
          return item
            .group_name
            .toLowerCase()
            .indexOf(val.toLowerCase()) > -1;
        });
    }
  }

  /** stop searching */
  focusoutEvent() : void {
    //this.localDb.worldGroups = this.searchGroupArray;
  }

  /** start searching */
  onKeyEvent() : void {
    console.log(this.searchQuerry);
    if (this.searchQuerry.length == 1) {
      this.localDb.worldGroups = this.searchGroupArray;
    }
  }

  /** show image */
  showImage(img) {
    // console.log(img)
    if (img == 'no_image.jpeg') {
      return 'assets/group-icon.png';
    } else {
      return this.apiProvider.imageUrl + '/' + img;
    }
  }

  /** navigate to group detail */
  groupDetail(group) {
    console.log(group);
    let is_joined = false;
    if (group.type == 0) {

      this
        .navCtrl
        .push('GroupChatViewPage', {
          contact: group,
          path: 'world groups'
        });
    } else {
      this
        .alertProvider
        .showAlert('You can not visit private groups');
    }
  }

  getPublicGroups() {

    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 0
    };
    this
      .groupProvider
      .getUserGroups(requestParams)
      .subscribe(data => {
        console.log('getPublicGroups', data);
        if (data.data.length != 0) {
          for (let d in data.data) {
            this
              .groupIds
              .push(data.data[d].id);
          }
          console.log('Ids ', this.groupIds);
        }
      }, err => {
        console.log('getPublicGroups', err);
      });
  }

  /** get private groups */
  getPrivateGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 1
    };
    this
      .groupProvider
      .getUserGroups(requestParams)
      .subscribe(data => {
        console.log('getPrivateGroups', data);
        if (data.data.length != 0) {
          for (let d in data.data) {
            this
              .groupIds
              .push(data.data[d].id);
          }
          console.log('Ids ', this.groupIds);
        }
      }, err => {
        console.log('getPrivateGroups', err);
      });
  }

  onClear(ev) {
    console.log("clear", ev);
    this.searchQuery = '';
    this.localDb.worldGroups = this.searchGroupArray;
  }
}
