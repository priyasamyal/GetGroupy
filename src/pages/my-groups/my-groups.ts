import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  MenuController,
  IonicPage,
  AlertController,
} from 'ionic-angular';
import {AlertProvider} from '../../providers/alert/alert';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {GroupProvider} from '../../providers/group/group';
import {NetworkProvider} from '../../providers/network/network';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';

declare var require: any;

@IonicPage()
@Component({selector: 'page-my-groups', templateUrl: 'my-groups.html'})
export class MyGroupsPage {
  groups: any;
  searchPublicGroupArray: any = [];
  searchPrivateGroupArray: any = [];
  searchQuerryPublic: string;
  searchQuerryPrivate: string;
  showOfflinePublicImage: boolean;
  showOfflinePrivateImage: boolean;
  groupIds: any = [];
  searchQuery = '';
  empty_array = [];
  empty_array1 = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuController: MenuController,
    public alertCtrl: AlertController,
    public alertProvider: AlertProvider,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider,
    public groupProvider: GroupProvider,
    public networkProvider: NetworkProvider,
    public localDb: LocalDatabaseProvider,
    public apiProvider: ApiProvider
  ) {
    this.menuController.enable(true, 'nav');
    this.groups = 'public';
    this.localDb.show = false;
    this.localDb.length = 0;
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad MyGroupsPage');
    this.localDb.length = 0;
    this.localDb.messagesShow = [];
    if (this.networkProvider.isOffline()) {
      this.localDb.publicGroups = [];
      this.localDb.privateGroups = [];
      this.localDb.getPublicGroups().then(
        data => {
          this.showOfflinePublicImage = true;
        },
        err => {}
      );
      this.localDb.getPrivateGroups().then(
        data => {
          this.showOfflinePrivateImage = true;
        },
        err => {}
      );
    } else {
      this.groupIds = [];
      this.getPublicGroups();
      this.getPrivateGroups();
    }
  }

  /** get public groups*/
  getPublicGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 0,
    };
    this.groupProvider.getUserGroups(requestParams).subscribe(
      data => {
        console.log(data, 'public groups');
        for (let d in data.data) {
          //   debugger;
          this.groupIds.push(data.data[d].id);
        }

        this.localDb.noPrivateGroups = false;
        this.showOfflinePublicImage = false;
        this.localDb.publicGroups = data.data;
        console.log(this.localDb.publicGroups, 'this.localDb.publicGroups.');
        this.searchPublicGroupArray = this.localDb.publicGroups;
        this.empty_array = this.localDb.publicGroups;
        for (let x in this.localDb.publicGroups) {
          var crypto = require('crypto');
          var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq');
          var dec = decipher.update(
            this.localDb.publicGroups[x].message,
            'hex',
            'utf8'
          );
          this.localDb.publicGroups[x].message = dec;
          let obj = {
            thread_id: this.localDb.publicGroups[x].thread_id,
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.localDb.publicGroups[x].id,
          };
          this.apiProvider.socket.emit('subscribe', obj);
          this.phoneNumberRegisterProvider.groupArrayCounter.push({
            thread_id: this.localDb.publicGroups[x].thread_id,
            chat_id: this.localDb.publicGroups[x].cid,
          });
        }

        this.phoneNumberRegisterProvider.setGroupCounterArray(
          this.phoneNumberRegisterProvider.groupArrayCounter
        );
        if (this.localDb.publicGroups.length == 0) {
          this.localDb.noPublicGroups = true;
        } else {
          this.localDb.noPublicGroups = false;
        }
        //  this.searchPublicGroupArray = this.localDb.publicGroups;
        this.localDb
          .savePublicGroups(this.localDb.publicGroups)
          .then(data => {});
      },
      err => {}
    );
  }

  /** get private groups */
  getPrivateGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 1,
    };
    this.groupProvider.getUserGroups(requestParams).subscribe(
      data => {
        this.showOfflinePrivateImage = false;
        this.localDb.privateGroups = data.data;
        this.empty_array1 = this.localDb.privateGroups;
        for (let x in this.localDb.privateGroups) {
          var crypto = require('crypto');
          var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq');
          var dec = decipher.update(
            this.localDb.privateGroups[x].message,
            'hex',
            'utf8'
          );
          this.localDb.privateGroups[x].message = dec;
          let obj = {
            thread_id: this.localDb.privateGroups[x].thread_id,
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.localDb.privateGroups[x].id,
          };
          this.apiProvider.socket.emit('subscribe', obj);
        }

        this.searchPrivateGroupArray = this.localDb.privateGroups;
        if (this.localDb.privateGroups.length == 0) {
          this.localDb.noPrivateGroups = true;
        } else {
          this.localDb.noPrivateGroups = false;
        }
        this.localDb
          .savePrivateGroups(this.localDb.privateGroups)
          .then(data => {});

        for (let d in data.data) {
          this.groupIds.push(data.data[d].id);
        }
      },
      err => {}
    );
  }

  /** exit from group */
  exitFromGroup(group_id, is_admin) {
    if (this.networkProvider.isOffline()) {
      this.alertProvider.showAlert('No internet!');
    } else {
      // if (is_admin) {   this.alertProvider.showAlert("Being admin,You cant leave
      // group") } else {
      this.showConfirm(group_id);

      // }
    }
  }

  showConfirm(group_id) {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to exit this group?',
      message:
        'If you delete yourself from this group, you will no longer be able to send/recie' +
        've messages from this group.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {},
        },
        {
          text: 'Ok',
          handler: () => {
            let requestParams = {
              group_id: group_id,
              user_id: this.phoneNumberRegisterProvider.user_id,
            };
            this.groupProvider.ExitGroup(requestParams).subscribe(
              data => {
                this.getPrivateGroups();
                this.getPublicGroups();
              },
              err => {
                this.alertProvider.showAlert('Server not responding');
              }
            );
          },
        },
      ],
    });
    confirm.present();
  }

  /**navigate to Create group */
  creatGroup() {
    this.navCtrl.push('CreateGroupSecondStepPage', {
      user_id: this.phoneNumberRegisterProvider.user_id,
      my_groupIds: this.groupIds,
    });
  }

  /** navigate to group detail */
  groupDetail(group) {
    this.navCtrl.push('GroupDetailPage', {
      group: group,
      user_id: this.phoneNumberRegisterProvider.user_id,
      my_groupIds: this.groupIds,
    });
  }

  /** go to chat view */
  groupChat(group) {
    console.log(group, 'groups....');
    if (status == '2') {
      // if blocked group then cant enter to chat or detial
      this.alertProvider.showAlert(
        'You have blocked this group so cannot enter into this group.'
      );
    } else {
      this.navCtrl.push('GroupChatViewPage', {
        contact: group,
        status: status,
        path: undefined,
        my_groupIds: this.groupIds,
      });
    }
  }

  /** show image */
  showImage(img) {
    if (img == 'no_image.jpeg') {
      return 'assets/group-icon.png';
    } else {
      return this.apiProvider.imageUrl + '/' + img;
    }
  }

  /** search groups */
  searchGroups(ev) {
    console.log(ev, 'searchGroup...s');
    //debugger;
    if (this.groups == 'public') {
      let val = ev.target.value;
      this.searchQuerryPublic = ev.target.value;
      console.log(val, 'val');
      if (val && val.trim() != '') {
        console.log(
          this.localDb.publicGroups,
          'this.localDb.publicGroups',
          this.searchPublicGroupArray
        );
        this.localDb.publicGroups = this.searchPublicGroupArray.filter(item => {
          console.log(item, 'iem');
          return (
            item.group_name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.group_name_he.toLowerCase().indexOf(val.toLowerCase()) > -1
          );
        });
      }
    } else if (this.groups == 'private') {
      let val = ev.target.value;
      this.searchQuerryPrivate = ev.target.value;
      if (val && val.trim() != '') {
        this.localDb.privateGroups = this.searchPrivateGroupArray.filter(
          item => {
            return (
              item.group_name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
              item.group_name_he.toLowerCase().indexOf(val.toLowerCase()) > -1
            );
          }
        );
      }
    } else {
      //
    }
  }

  /** stop searching */
  focusoutEvent(): void {}

  onKeyEvent(): void {
    if (this.groups == 'public') {
      if (this.searchQuerryPublic.length == 1) {
        this.localDb.publicGroups = this.searchPublicGroupArray;
      } else if (this.searchQuery.length == 0) {
        this.localDb.publicGroups = this.searchPublicGroupArray;
      }
    } else if (this.groups == 'private') {
      if (this.searchQuerryPrivate.length == 1) {
        this.localDb.privateGroups = this.searchPrivateGroupArray;
      }
    } else {
      //
    }
  }

  /** on clear  */
  onClear(ev) {
    console.log('co clear');
    this.searchQuery = '';
    if (this.groups == 'public') {
      this.localDb.publicGroups = this.searchPublicGroupArray;
    } else if (this.groups == 'private') {
      this.localDb.privateGroups = this.searchPrivateGroupArray;
    } else {
      //
    }
  }
  /** confirm group */
  confirmGroup(group_id, status, key) {
    let requestParams = {
      group_id: group_id,
      user_id: this.phoneNumberRegisterProvider.user_id,
      status: status,
    };
    this.groupProvider.ConfirmBlockGroup(requestParams).subscribe(
      data => {
        this.alertProvider.showAlert('Successfully confirmed this group');
        if (key == 'public') {
          this.getPublicGroups();
        } else {
          this.getPrivateGroups();
        }
      },
      err => {}
    );
  }

  /** block group */
  blockGroup(group_id, status, key) {
    let requestParams = {
      group_id: group_id,
      user_id: this.phoneNumberRegisterProvider.user_id,
      status: status,
    };
    this.groupProvider.ConfirmBlockGroup(requestParams).subscribe(
      data => {
        this.alertProvider.showAlert('Successfully blocked this group');
        if (key == 'public') {
          this.getPublicGroups();
        } else {
          this.getPrivateGroups();
        }
      },
      err => {
          
      }
    );
  }
}
