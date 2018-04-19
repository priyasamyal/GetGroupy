import {Component} from '@angular/core';
import {NavController, NavParams, IonicPage} from 'ionic-angular';
import {GroupProvider} from '../../providers/group/group';
import {NetworkProvider} from '../../providers/network/network';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {ChatsProvider} from '../../providers/chats/chats';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {AlertProvider} from '../../providers/alert/alert';

@IonicPage()
@Component({selector: 'page-group-detail-popover', templateUrl: 'group-detail-popover.html'})
export class GroupDetailPopoverPage {
  member_name : string;
  is_admin : any;
  member_id : any;
  chatList : any = [];
  contacts : any = [];
  constructor(public navCtrl : NavController, public navParams : NavParams, public chatsProvider : ChatsProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public groupProvider : GroupProvider, public networkProvider : NetworkProvider, public localDb : LocalDatabaseProvider, public alertProvider : AlertProvider,) {
    let member = this
      .navParams
      .get('member');
    this.member_name = member.name;
    this.is_admin = member.is_admin;
    this.member_id = member.userId;
    console.log(member);
    console.log(this.is_admin);
    console.log(this.phoneNumberRegisterProvider.user_id)

  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad GroupDetailPopoverPage');
    this.getChatLists();
  }

  /** make/remove admin */
  makeRemoveAdmin(status) {
    if (this.networkProvider.isOffline()) {
      this
        .alertProvider
        .showAlert("No internet!");
    } else {
      let requestParams = {
        group_id: this
          .navParams
          .get('group_id'),
        user_id: this.member_id,
        is_admin_status: status
      }
      this
        .groupProvider
        .MakeRemoveAdmin(requestParams)
        .subscribe(data => {
          let Params = {
            'group_id': requestParams.group_id
          };
          this
            .groupProvider
            .getGroupDetail(Params)
            .subscribe(data => {
              console.log("after admin add remove..,", data);
              this
                .localDb
                .popover
                .dismiss();
            }, err => {
              console.log(err)
            })
        }, err => {
          console.log(err);
          this
            .alertProvider
            .showAlert("Server not responding");
        });
    }
  }

  /** remove member */
  removeMember() {
    let requestParams = {
      group_id: this
        .navParams
        .get('group_id'),
      user_id: this.member_id
    }
    this
      .groupProvider
      .ExitGroup(requestParams)
      .subscribe(data => {
        console.log(data);
        let Params = {
          'group_id': requestParams.group_id
        };
        this
          .groupProvider
          .getGroupDetail(Params)
          .subscribe(data => {
            console.log("after admin add remove..,", data);
            this
              .localDb
              .popover
              .dismiss();
          }, err => {
            console.log(err);
            this
              .alertProvider
              .showAlert("Server not responding");
          })

      })
  }

  // get all users whom we have chated yet
  getChatLists() {
    this
      .chatsProvider
      .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
      .subscribe(data => {
        console.log("getChatLists........", data);

        if (data.data.length != 0) {
          for (let m in data.data) {

            this
              .chatList
              .push({
                lastMessage: data.data[m].message,
                thread_id: data.data[m].thread_id,
                contact_id: data.data[m].userID,
                displayName: data.data[m].username,
                phoneNumbers: data.data[m].mobile_no,
                photos: null,
                sent: true,
                is_online: data.data[m].is_online,
                last_seen: data.data[m].last_seen,
                blocked_user_id: data.data[m].blocked_user_id,
                blocking_user_id: data.data[m].blocking_user_id

              })
          }

        }
        this
          .localDb
          .saveChatList(data.data);
        console.log(this.chatList);
      }, err => {
        console.log(err);
      })
  }

  // go to chat view
  goToChat(index) {
    console.log(this.navParams.get('member'));

    let contact = this
      .navParams
      .get('member');
    contact.thread_id = null;
    if (this.chatList.length != 0) {
      for (let x in this.chatList) {
        console.log("chat list...", this.chatList);
        console.log("contactlist..", contact);
        if (this.chatList[x].contact_id == contact.userId) {
          contact.thread_id = this.chatList[x].thread_id;
          contact.is_online = this.chatList[x].is_online;
          contact.last_seen = this.chatList[x].last_seen;
        }
      }
      this
        .navCtrl
        .push("ChatViewPage", {contact: contact})

    } else {
      console.log("null send ");

      this
        .navCtrl
        .push("ChatViewPage", {contact: contact})
    }
  }
}
