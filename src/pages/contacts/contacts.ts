import {Component} from '@angular/core';
import {NavController, NavParams, PopoverController, MenuController, IonicPage} from 'ionic-angular';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {SocialSharing} from '@ionic-native/social-sharing';

import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ContactsProvider} from '../../providers/contacts/contacts';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {GroupProvider} from '../../providers/group/group';
import {ChatsProvider} from '../../providers/chats/chats';
import {NetworkProvider} from '../../providers/network/network';
import {ApiProvider} from '../../providers/api/api';

@IonicPage()
@Component({selector: 'page-contacts', templateUrl: 'contacts.html'})

export class ContactsPage {
  searchQuery = '';
  searchMyContactArray : any = [];
  searchMyGroupArray : any = [];
  searchAroundArray : any = [];
  searchQueryContact : string
  searchQueryGroup : string;
  searchQueryAround : string;
  noContacts : boolean;
  chatList : any = [];
  contacts : any = [];
  userId : any;
  block_status = [];
  distance : number = 5;

  defaultPage : any = 'my_contacts';
  constructor(public navCtrl : NavController, public apiProvider : ApiProvider, public navParams : NavParams, public popoverCtrl : PopoverController, public groupProvider : GroupProvider, public menuController : MenuController, private sanitizer : DomSanitizer, private socialSharing : SocialSharing, public localDb : LocalDatabaseProvider, public contactsProvider : ContactsProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public chatsProvider : ChatsProvider, public networkProvider : NetworkProvider) {
    this
      .menuController
      .enable(true, "nav");
    this.userId = this.phoneNumberRegisterProvider.user_id;

    console.log(this.block_status.length, "block length");
    console.log(this.distance);

    this
      .localDb
      .getContacts();
    this.userId = this.phoneNumberRegisterProvider.user_id;
    this.distance = 10;
    this.getMyGroupContact();
    this.searchMyContactArray = this.localDb.contacts;
    console.log("this.phoneNumberRegisterProvider.groupIds", this.phoneNumberRegisterProvider.groupIds);

  }

  ionViewWillEnter() {
    console.log("enter view");
    if (this.networkProvider.isOffline()) {
      this
        .localDb
        .getContacts();
    } else {
      this
        .contactsProvider
        .fetchContactsFromMobile()
        .then(data => {
          this
            .localDb
            .getContacts();
        });
      this.getChatLists();
      this.getMyGroupContact();
      this.getAroundMeContact();

    }
  }

  // get group contacts

  getMyGroupContact() {
    let RequestParams = {
      group_ids: this.phoneNumberRegisterProvider.groupIds
    };
    console.log(RequestParams, 'params');
    this
      .groupProvider
      .getMyGroupContact(RequestParams)
      .then(data => {
        this.phoneNumberRegisterProvider.my_group_contact = data;
        console.log(data, 'data getMyGroupContact');
        this
          .phoneNumberRegisterProvider
          .my_group_contact
          .map(c => (c.isCheck = false));
        this.searchMyGroupArray = this.phoneNumberRegisterProvider.my_group_contact;
        console.log(this.phoneNumberRegisterProvider.my_group_contact, 'contct');
      }, err => {});
  }

  // get users around me
  getAroundMeContact() {
    let RequestParams = {

      lat: this.localDb.current_lat,
      lng: this.localDb.current_lng,
      distance: this.distance,
      user_id: this.phoneNumberRegisterProvider.user_id
    };
    console.log(RequestParams, 'params');
    this
      .groupProvider
      .getContactAroundMe(RequestParams)
      .then(data => {
        this.phoneNumberRegisterProvider.around_contact = data;
        console.log(data, 'data getContactAroundMe');
        this
          .phoneNumberRegisterProvider
          .around_contact
          .map(c => (c.isCheck = false));
        this.searchAroundArray = this.phoneNumberRegisterProvider.around_contact;
        console.log(this.phoneNumberRegisterProvider.around_contact, 'contct');
      }, err => {});
  }

  // chgange radius
  changeDistance() {
    console.log(this.distance);
    this.phoneNumberRegisterProvider.around_contact = [];
    this.getAroundMeContact();
  }
  // get all users whom we have chated yet
  getChatLists() {
    this
      .chatsProvider
      .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
      .subscribe(data => {
        console.log(data);
        this.block_status = [];
        if (data.data.length != 0) {
          for (let m in data.data) {
            this
              .block_status
              .push({blocked_user_id: data.data[m].blocked_user_id, blocking_user_id: data.data[m].blocking_user_id});
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
          console.log(this.block_status, "Array block status")
        }
        this
          .localDb
          .saveChatList(data.data);
        console.log(this.chatList);
      }, err => {
        console.log(err);
      })
  }

  getPicture(image) {
    return this
      .sanitizer
      .bypassSecurityTrustUrl(image);
  }

  presentPopover(ev : UIEvent) {
    console.log(event);
    let popover = this
      .popoverCtrl
      .create("PopoverPage");
    popover.present({ev: event});
  }

  // go to chat view
  goToChat(contact, index) {

    if (this.chatList.length != 0) {
      for (let x in this.chatList) {
        console.log("chat list...", this.chatList);
        console.log("contact list..", contact);
        if (this.chatList[x].contact_id == contact.userId) {
          contact.thread_id = this.chatList[x].thread_id;
          contact.is_online = this.chatList[x].is_online;
          contact.last_seen = this.chatList[x].last_seen;
          // this   .phoneNumberRegisterProvider   .setUserBlockStatus({blocked_user_id:
          // this.chatList[x].blocked_user_id, blocking_user_id:
          // this.chatList[x].blocking_user_id});
        }

      }
      this
        .navCtrl
        .push("ChatViewPage", {contact: contact});
    } else {
      console.log("null send")
      // this   .phoneNumberRegisterProvider   .setUserBlockStatus({blocked_user_id:
      // null, blocking_user_id: null});
      this
        .navCtrl
        .push("ChatViewPage", {contact: contact});
    }

  }

  /** share app */
  shareApp() {
    this
      .socialSharing
      .share("Install this app for chatting", "GetGroupy", "", "")
      .then(() => {
        // Success!
      })
      .catch(() => {
        // Error!
      });
  }

  /** search groups */
  searchGroups(ev) {
    if (this.defaultPage == "my_contacts") {
      let val = ev.target.value;
      this.searchQueryContact = ev.target.value;
      if (val && val.trim() != '') {
        this.localDb.contacts = this
          .searchMyContactArray
          .filter((item) => {
            return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
      }
    } else if (this.defaultPage == "group_contacts") {
      let val = ev.target.value;
      this.searchQueryGroup = ev.target.value;
      if (val && val.trim() != '') {
        this.phoneNumberRegisterProvider.my_group_contact = this
          .searchMyGroupArray
          .filter((item) => {
            return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
      }
    } else if (this.defaultPage == "around_contacts") {
      let val = ev.target.value;
      this.searchQueryAround = ev.target.value;
      if (val && val.trim() != '') {
        this.phoneNumberRegisterProvider.around_contact = this
          .searchAroundArray
          .filter((item) => {
            return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
          })
      }
    }
  }

  /** start searching */
  onKeyEvent() : void {
    if(this.defaultPage == "my_contacts") {
      if (this.searchQueryContact.length == 1) {
        this.localDb.contacts = this.searchMyContactArray;
      } else if (this.searchQuery.length == 0) {
        this.localDb.contacts = this.searchMyContactArray;
      }
    } else if (this.defaultPage == "group_contacts") {
      if (this.searchQueryGroup.length == 1) {
        this.phoneNumberRegisterProvider.my_group_contact = this.searchMyGroupArray;
      } else if (this.searchQuery.length == 0) {
        this.phoneNumberRegisterProvider.my_group_contact = this.searchMyGroupArray;
      }
    } else if (this.defaultPage == "around_contacts") {
      if (this.searchQueryGroup.length == 1) {
        this.phoneNumberRegisterProvider.around_contact = this.searchAroundArray;
      } else if (this.searchQuery.length == 0) {
        this.phoneNumberRegisterProvider.around_contact = this.searchAroundArray;
      }
    }
  }
  onClear(ev) {
    console.log("clear", ev);
    this.searchQuery = '';
    if (this.defaultPage == "my_contacts") {
      this.localDb.contacts = this.searchMyContactArray;
    } else if (this.defaultPage == "group_contacts") {
      this.phoneNumberRegisterProvider.my_group_contact = this.searchAroundArray;
    } else if (this.defaultPage == "around_contacts") {
      this.phoneNumberRegisterProvider.around_contact = this.searchAroundArray;
    }
  }

}
