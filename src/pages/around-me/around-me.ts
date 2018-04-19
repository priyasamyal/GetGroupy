import {Component} from '@angular/core';
import {NavController, NavParams, IonicPage} from 'ionic-angular';

import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {GroupProvider} from '../../providers/group/group';
import {NetworkProvider} from '../../providers/network/network';
import {AlertProvider} from '../../providers/alert/alert';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';
import {ContactsProvider} from '../../providers/contacts/contacts';
import {ChatsProvider} from '../../providers/chats/chats';
@IonicPage()
@Component({selector: 'page-around-me', templateUrl: 'around-me.html'})
export class AroundMePage {
  distance: number;
  showOfflineImage: boolean;

  searchQuerry: string;
  searchQuery: any;
  defaultPage: any = 'my_users';
  searchQueryAround: string;
  searchGroupArray: any = [];
  searchAroundArray: any = [];

  chatList: any = [];
  block_status = [];
  userId: any;
  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider,
    public groupProvider: GroupProvider,
    public networkProvider: NetworkProvider,
    public alertProvider: AlertProvider,
    public localDb: LocalDatabaseProvider,
    public apiProvider: ApiProvider,
    public contactsProvider: ContactsProvider,
    public chatsProvider: ChatsProvider
  ) {
    this.distance = 10;
    this.userId = this.phoneNumberRegisterProvider.user_id;
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad AroundMePage');
    console.log('ionViewDidLoad PrivateGroupsPage');
    if (this.networkProvider.isOffline()) {
      this.localDb.aroundMeGroups = [];
      this.alertProvider.showAlert('No internet!');
      // this.localDb.getWorldGroups().then(data => {   this.showOfflineImage = true;
      // console.log("getWorldGroups",     data); }, err => {   console.log("error",
      // err); })
    } else {
      this.showOfflineImage = false;
      this.getAroundMeGroups();
      this.getAroundMeContact(this.distance);
      this.getChatLists();
    }
  }
  // get all users whom we have chated yet
  getChatLists() {
    this.chatsProvider
      .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
      .subscribe(
        data => {
          console.log(data);
          this.block_status = [];
          if (data.data.length != 0) {
            for (let m in data.data) {
              this.block_status.push({
                blocked_user_id: data.data[m].blocked_user_id,
                blocking_user_id: data.data[m].blocking_user_id,
              });
              this.chatList.push({
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
                blocking_user_id: data.data[m].blocking_user_id,
              });
            }
            console.log(this.block_status, 'Array block status');
          }
          this.localDb.saveChatList(data.data);
          console.log(this.chatList, 'chats List');
        },
        err => {
          console.log(err);
        }
      );
  }
  /** get around me groups */
  getAroundMeGroups() {
    let requestParams = {
      lat: this.localDb.current_lat,
      lng: this.localDb.current_lng,
      distance: this.distance,
    };
    this.groupProvider.getAroundMeGroups(requestParams).subscribe(
      data => {
        this.localDb.aroundMeGroups = data.data;
        this.searchGroupArray = this.localDb.aroundMeGroups;

        if (this.localDb.aroundMeGroups.length == 0) {
          this.localDb.noaroundMeGroups = true;
        } else {
          this.localDb.noaroundMeGroups = false;
        }
        // this.localDb.saveWorldGroups(this.localDb.worldGroups).then(data => { })
      },
      err => {
        console.log(err);
        this.alertProvider.showAlert('Serve not responding');
      }
    );
  }

  /** change radius */
  changeDistance(distance) {
    if (this.defaultPage == 'my_users') {
      this.phoneNumberRegisterProvider.around_contact = [];
      this.getAroundMeContact(distance);
    } else {
      console.log(distance);
      this.localDb.aroundMeGroups = [];
      this.getAroundMeGroups();
    }
  }

  /** navigate to group detail */
  groupDetail(group) {
    console.log(group);
    let is_joined = false;
    if (group.type == 0) {
      this.navCtrl.push('GroupChatViewPage', {
        contact: group,
        path: 'around groups',
      });
    } else {
      this.alertProvider.showAlert('You can not visit private groups');
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
  /** search groups */
  searchGroups(ev) {
    if (this.defaultPage == 'my_users') {
      let val = ev.target.value;
      this.searchQueryAround = ev.target.value;
      if (val && val.trim() != '') {
        this.phoneNumberRegisterProvider.around_contact = this.searchAroundArray.filter(
          item => {
            console.log(item, 'item...');
            return (
              item.name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
              item.name_he.toLowerCase().indexOf(val.toLowerCase()) > -1
            );
          }
        );
      }
    } else {
      let val = ev.target.value;
      this.searchQuerry = ev.target.value;
      if (val && val.trim() != '') {
        this.localDb.aroundMeGroups = this.searchGroupArray.filter(item => {
          console.log(item, 'item...');
          return (
            item.group_name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.group_name_he.toLowerCase().indexOf(val.toLowerCase()) > -1
          );
        });
      }
    }
  }

  /** stop searching */
  focusoutEvent(): void {
    // this.localDb.aroundMeGroups = this.searchGroupArray;
  }

  /** start searching */
  onKeyEvent(): void {
    if (this.defaultPage == 'my_users') {
      console.log(this.searchQueryAround);
      if (this.searchQueryAround.length == 1) {
        this.phoneNumberRegisterProvider.around_contact = this.searchAroundArray;
      }
    } else {
      console.log(this.searchQuerry);
      if (this.searchQuerry.length == 1) {
        this.localDb.aroundMeGroups = this.searchGroupArray;
      }
    }
  }

  onClear(ev) {
    console.log('clear', ev);
    this.searchQuery = '';
    if (this.defaultPage == 'my_users') {
      this.phoneNumberRegisterProvider.around_contact = this.searchAroundArray;
    } else {
      this.localDb.aroundMeGroups = this.searchGroupArray;
    }
  }

  // get users around me
  getAroundMeContact(distance) {
    var test_array;
    let RequestParams = {
      lat: this.localDb.current_lat,
      lng: this.localDb.current_lng,
      distance: distance,
      user_id: this.phoneNumberRegisterProvider.user_id,
    };
    console.log(RequestParams, 'params');
    this.groupProvider.getContactAroundMe(RequestParams).then(
      data => {
        this.phoneNumberRegisterProvider.around_contact = data;
        console.log(data, 'data getContactAroundMe');
        this.phoneNumberRegisterProvider.around_contact.map(c => {
          c.isCheck = false;
          c.mob =
            c.mobile_no.charAt(0) +
            'xxx-xxxx-xxx' +
            c.mobile_no.charAt(c.mobile_no.length - 1);
        });
        this.searchAroundArray = this.phoneNumberRegisterProvider.around_contact;
        console.log(this.searchAroundArray, 'this.searchAroundArray');
        console.log(
          this.phoneNumberRegisterProvider.around_contact,
          'this.phoneNumberRegisterProvider.around_contact'
        );
        this.searchAroundArray = this.phoneNumberRegisterProvider.around_contact;
        console.log(this.phoneNumberRegisterProvider.around_contact, 'contct');
      },
      err => {}
    );

    this.contactsProvider.fetchContactsFromMobile().then(data => {
      this.localDb.getContacts();
      console.log(this.localDb.contacts, 'contact users');

      for (let i in this.phoneNumberRegisterProvider.around_contact) {
        for (let j in this.localDb.contacts) {
          if (
            this.phoneNumberRegisterProvider.around_contact[i].mobile_no ==
            this.localDb.contacts[j].mobile_no
          ) {
            console.log(
              'if call',
              this.phoneNumberRegisterProvider.around_contact[
                i
              ].mobile_no.charAt(0)
            );
            this.phoneNumberRegisterProvider.around_contact[
              i
            ].name = this.localDb.contacts[j].name;

            this.phoneNumberRegisterProvider.around_contact[
              i
            ].mob = this.phoneNumberRegisterProvider.around_contact[
              i
            ].mobile_no;
          }
        }
      }
    });
  }

  // go to chat view
  goToChat(contact, index) {
    if (this.chatList.length != 0) {
      for (let x in this.chatList) {
        console.log('chat list...', this.chatList);
        console.log('contact list..', contact);
        if (this.chatList[x].contact_id == contact.id) {
          contact.thread_id = this.chatList[x].thread_id;
          contact.is_online = this.chatList[x].is_online;
          contact.last_seen = this.chatList[x].last_seen;
          // this   .phoneNumberRegisterProvider   .setUserBlockStatus({blocked_user_id:
          // this.chatList[x].blocked_user_id, blocking_user_id:
          // this.chatList[x].blocking_user_id});
        }
      }
      this.navCtrl.push('ChatViewPage', {contact: contact});
    } else {
      console.log('null send');
      // this   .phoneNumberRegisterProvider   .setUserBlockStatus({blocked_user_id:
      // null, blocking_user_id: null});
      this.navCtrl.push('ChatViewPage', {contact: contact});
    }
  }
}
