import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  PopoverController,
  IonicPage,
  App,
  AlertController
} from 'ionic-angular';

import {AlertProvider} from '../../providers/alert/alert';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {GroupProvider} from '../../providers/group/group';
import {NetworkProvider} from '../../providers/network/network';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';
//import {Push} from '@ionic-native/push';

@IonicPage()
@Component({selector: 'page-group-detail', templateUrl: 'group-detail.html'})
export class GroupDetailPage {
  group_image : any;
  group_id : any;
  group_name : any;
  createdAt : any;
  member_count : any;
  showOfflineImage : boolean;
  popover : any;
  is_admin : any;
  showJoinBtn : boolean = false;
  joined : boolean = false;
  groupMembers : any = [];
  description : string = "";
  constructor(public navCtrl : NavController, public popoverCtrl : PopoverController, public app : App, public alertCtrl : AlertController, public navParams : NavParams, public alertProvider : AlertProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public groupProvider : GroupProvider, public networkProvider : NetworkProvider, public localDb : LocalDatabaseProvider, public apiProvider : ApiProvider) {
    let group = this
      .navParams
      .get('group');

    this.group_id = group.id;
    this.group_name = group.group_name;
    this.group_image = group.group_image;
    this.createdAt = group.date_added;
    this.description = group.description;
    if (this.navParams.get('path') == "world groups" || this.navParams.get('path') == "around groups") {
      this.showJoinBtn = true;
    } else {
      this.showJoinBtn = false;
    }

    this.is_admin = group.is_admin;

  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad GroupDetailPage');
    if (this.networkProvider.isOffline()) {
      this.showOfflineImage = true;
      this
        .localDb
        .getGroupDetailById(this.group_id)
        .then(data => {
          this.localDb.groupDetail = [];

        })
    } else {
      this.showOfflineImage = false;
      this.getGroupDetail();
    }
  }

  ionViewDidLeave() {
    this
      .localDb
      .popover
      .dismiss();
  }

  getGroupDetail() {
    let requestParams = {
      'group_id': this.group_id
    };
    this
      .groupProvider
      .getGroupDetail(requestParams)
      .subscribe(data => {

        for (let x of this.localDb.groupDetail) {

          if (x.userId == this.phoneNumberRegisterProvider.user_id) {
            this.joined = true;
          } else {
            this.joined = false;
          }
        }
        this
          .localDb
          .saveGroupsDeatil(this.localDb.groupDetail, this.group_id)
          .then(data => {}, err => {})
      }, err => {

        this
          .alertProvider
          .showAlert("Server not responding")
      })
  }

  /** Get group image */
  getGroupImage(img) {
    //debugger;
    if (img == "no_image.jpeg") {
      let group_image = "assets/group-icon.png";
      return 'url(' + group_image + ')';

    } else if (img.startsWith("file")) {
      return 'url(' + img + ')';
    } else if (img.startsWith("http")) {
      return 'url(' + img + ')';
    } else {
      let group_image = img;
      return 'url(' + this.apiProvider.imageUrl + "/" + group_image + ')';
    }
  }

  /** popover show */
  presentPopover(ev : UIEvent, member) {
    this.localDb.popover = this
      .popoverCtrl
      .create("GroupDetailPopoverPage", {
        member: member,
        group_id: this.group_id,
        is_admin: member.is_admin
      });
    this
      .localDb
      .popover
      .present({ev: event});
  }

  /** navigate to group edit page */
  groupEdit() {
    this
      .navCtrl
      .push("GroupEditPage", {
        group: this
          .navParams
          .get('group')
      });
  }

  /** add members */
  addMembers() {

    this
      .navCtrl
      .push("AddMembersPage", {
        group: this.localDb.groupDetail,
        group_detail: this
          .navParams
          .get('group'),
        my_groupIds: this
          .navParams
          .get('my_groupIds')
      })
  }

  /** exit from group */
  exitFromGroup(group_id, is_admin) {
    if (this.networkProvider.isOffline()) {
      this
        .alertProvider
        .showAlert("No internet!");
    } else {
      // if (is_admin) {   this.alertProvider.showAlert("Being admin,You cant leave
      // group") } else {
      this.showConfirm(group_id);

      // }

    }

  }

  showConfirm(group_id) {
    let confirm = this
      .alertCtrl
      .create({
        title: 'Are you sure you want to exit this group?',
        message: 'If you delete yourself from this group, you will no longer be able to send/recie' +
            've messages from this group.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {}
          }, {
            text: 'Ok',
            handler: () => {

              let requestParams = {
                group_id: group_id,
                user_id: this.phoneNumberRegisterProvider.user_id
              }
              this
                .groupProvider
                .ExitGroup(requestParams)
                .subscribe(data => {

                  let nav = this
                    .app
                    .getRootNav();
                  nav.setRoot("TabsPage", {tabIndex: 2});
                }, err => {

                  this
                    .alertProvider
                    .showAlert("Server not responding");
                })
            }
          }
        ]
      });
    confirm.present();
  }

  /** got ot chat view */
  goToChat() {
    if (this.joined == true) {

      this
        .navCtrl
        .push("GroupChatViewPage", {
          contact: this
            .navParams
            .get('group')
        })
        .then(() => {
          const index = this
            .navCtrl
            .getActive()
            .index;
          this
            .navCtrl
            .remove(index - 1);
          this
            .navCtrl
            .remove(index - 2);
        });
    } else if (this.joined == false) {

      this
        .groupMembers
        .push({user_id: this.phoneNumberRegisterProvider.user_id});

      let requestParams = {
        group_id: this.group_id,
        user_ids_ar: this.groupMembers
      }

      let groupInfo = this
        .navParams
        .get("group");
      groupInfo.is_joined = this.joined;

      this
        .navCtrl
        .push("GroupChatViewPage", {
          contact: groupInfo,
          params: requestParams
        })
        .then(() => {
          const index = this
            .navCtrl
            .getActive()
            .index;
          this
            .navCtrl
            .remove(index - 1);
          this
            .navCtrl
            .remove(index - 2);
        });
    }
  }

  /** add members to group*/
  addMembersToGroup(status) {
    if (this.networkProvider.isOffline()) {
      this
        .alertProvider
        .showAlert("No internet!")
    } else {
      var arr = [];
      arr.push({user_id: this.phoneNumberRegisterProvider.user_id});
      let requestParams = {
        group_id: this.group_id,
        user_ids_ar: arr,
        status: 1
      }
      this
        .groupProvider
        .AddGroupMembers(requestParams)
        .subscribe(data => {

          this
            .alertProvider
            .showAlert("You are added to this group");
          this.getPublicGroups();
          this.getPrivateGroups();
          this
            .navCtrl
            .push("TabsPage", {tabIndex: 2})

        }, err => {

          this
            .alertProvider
            .showAlert("Server not responding")
        })
    }

  }

  /** get public groups*/
  getPublicGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 0
    }
    this
      .groupProvider
      .getUserGroups(requestParams)
      .subscribe(data => {

        this.localDb.publicGroups = data.data;

        if (this.localDb.publicGroups.length == 0) {
          this.localDb.noPublicGroups = true
        } else {
          this.localDb.noPrivateGroups = false;
        }

        this
          .localDb
          .savePublicGroups(this.localDb.publicGroups)
          .then(data => {})

      }, err => {})
  }

  /** get private groups */
  getPrivateGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 1
    }
    this
      .groupProvider
      .getUserGroups(requestParams)
      .subscribe(data => {

        this.localDb.privateGroups = data.data;
        if (this.localDb.privateGroups.length == 0) {
          this.localDb.noPrivateGroups = true;
        } else {
          this.localDb.noPrivateGroups = false;
        }
        this
          .localDb
          .savePrivateGroups(this.localDb.privateGroups)
          .then(data => {})

      }, err => {})
  }
}
