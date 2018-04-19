import {Component} from '@angular/core';
import {NavController, NavParams, IonicPage, App, ModalController} from 'ionic-angular';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

// import { CreateGroupSecondStepPage } from
// '../create-group-second-step/create-group-second-step';
import {ApiProvider} from '../../providers/api/api';

import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {ContactsProvider} from '../../providers/contacts/contacts';
import {AlertProvider} from '../../providers/alert/alert';
import {GroupProvider} from '../../providers/group/group';

@IonicPage()
@Component({selector: 'page-create-group', templateUrl: 'create-group.html'})
export class CreateGroupPage {
  members : any = [];
  userId : any;
  defaultPage : any = 'my_contacts';
  distance : number;
  my_group_contact : any = [];
  my_group_around_me : any = [];
  groupMembers : any = [];
  constructor(public navCtrl : NavController, public app : App, public modalCtrl : ModalController, public navParams : NavParams, private sanitizer : DomSanitizer, public contactsProvider : ContactsProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public alertProvider : AlertProvider, public localDb : LocalDatabaseProvider, public groupProvider : GroupProvider, public apiProvider : ApiProvider) {
    this
      .localDb
      .getContacts();
    this.userId = this.phoneNumberRegisterProvider.user_id;
    this.distance = 10;
    this.getMyGroupContact();
    this.getAroundMeContact();
    console.log(this.navParams.get("my_groupIds"), "ids")
    console.log(this.navParams.get('object'));
    console.log("localDb.contacts", this.localDb.contacts);
  }

  ionViewWillEnter() {
    console.log(this.navParams.get('my_groupIds'));
    console.log('ionViewDidLoad CreateGroupPage');
    this
      .contactsProvider
      .friendsContacts
      .map(c => (c.isCheck = false));
    console.log(this.contactsProvider.friendsContacts);
  }

  getMyGroupContact() {
    let RequestParams = {
      group_ids: this
        .navParams
        .get('my_groupIds')
    };
    console.log(RequestParams, 'params');
    this
      .groupProvider
      .getMyGroupContact(RequestParams)
      .then(data => {
        this.my_group_contact = data;
        console.log(data, 'data');
        this
          .my_group_contact
          .map(c => (c.isCheck = false));
        console.log(this.my_group_contact, 'contct');
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
        console.log(this.phoneNumberRegisterProvider.around_contact, 'contct');
      }, err => {});
  }

  // chnage radius
  changeDistance() {
    this.phoneNumberRegisterProvider.around_contact = [];
    this.getAroundMeContact();
  }
  getPicture(image) {

    return this
      .sanitizer
      .bypassSecurityTrustUrl(this.apiProvider.imageUrl + image);
  }

  addMembers(evt, index) {
   // debugger;
    if (this.defaultPage == 'my_contacts') {
      console.log(evt);
      if (!evt.isCheck) {
        this
          .members
          .push(evt);
        console.log(this.members, 'memebers');
        this.localDb.contacts[index].isCheck = true;
        // this   .my_group_contact   .map(c => {     if (c.id == evt.userId) {
        // c.isCheck = true;     }   }); this   .my_group_around_me   .map(c => {     if
        // (c.id == evt.userId) {       c.isCheck = true;     }   });

      }
    } else if (this.defaultPage == 'group_contacts') {
      if (!evt.isCheck) {
        this
          .members
          .push({isCheck: true, mobile_no: evt.mobile_no, name: evt.name, photo: evt.profile_picture, userId: evt.userId});
        console.log(this.members, 'memebers');
        this.my_group_contact[index].isCheck = true;
        // this   .localDb   .contacts   .map(c => {     if (c.userId == evt.userId) {
        // c.isCheck = true;     }   }); this   .my_group_around_me   .map(c => {  if
        // (c.id == evt.userId) {       c.isCheck = true;     }   });

      }
    } else if (this.defaultPage == 'around_contacts') {
      if (!evt.isCheck) {
        this
          .members
          .push({isCheck: true, mobile_no: evt.mobile_no, name: evt.username, photo: evt.profile_picture, userId: evt.id});
        console.log(this.members, 'memebers');
        this.phoneNumberRegisterProvider.around_contact[index].isCheck = true;
        // this   .localDb   .contacts   .map(c => {     if (c.userId == evt.id) {
        // c.isCheck = true;     }   }); this   .localDb   .contacts   .map(c => { if
        // (c.userId == evt.id) {       c.isCheck = true;     }   }); this
        // .phoneNumberRegisterProvider   .around_contact   .map(c => {     if (c.id ==
        // evt.userId) {       c.isCheck = true;     }   });

        this.localDb.modal = this
          .modalCtrl
          .create("MapModalPage", {
            lat: evt.lat,
            lng: evt.lng
          });
        this
          .localDb
          .modal
          .present();
      }
    }
  }

  removeMember(evt, index) {
    console.log(evt);
    this
      .localDb
      .contacts
      .map(c => {
        if (c.userId == evt.userId) {
          c.isCheck = false;
        }
      });

    this
      .my_group_contact
      .map(c => {
        if (c.id == evt.userId) {
          c.isCheck = false;
        }
      });
    this
      .my_group_around_me
      .map(c => {
        if (c.id == evt.userId) {
          c.isCheck = false;
        }
      });

    this
      .members
      .splice(index, 1);

  }

  /** navigate to second step */
  chooseGroupStepSecond() {
    console.log(this.members);

    for (let m in this.members) {
      this
        .groupMembers
        .push({user_id: this.members[m].userId})
    }

    if (this.navParams.get('object').groupIcon == "") {
      this.simpleGroupCreation();
    } else {
      this.groupCreationWithIcon();
    }
  }

  /**with icon */
  groupCreationWithIcon() {

    if (this.navParams.get('object').groupName == "") {
      this
        .alertProvider
        .showAlert("Please enter group name");
    } else if (this.navParams.get('object').groupType == "") {
      this
        .alertProvider
        .showAlert("Please choose group type");
    } else {
      let RequestParams = {
        group_name: this
          .navParams
          .get('object')
          .groupName,
        type: this
          .navParams
          .get('object')
          .groupType,
        user_ids_ar: this.groupMembers,
        admin_id: this.phoneNumberRegisterProvider.user_id,
        group_icon: this
          .navParams
          .get('object')
          .groupIcon,
        lat: this.localDb.current_lat,
        lng: this.localDb.current_lng,
        place: this.localDb.current_location,
        description: this
          .navParams
          .get('object')
          .description
      }
      console.log("requestParams", RequestParams)
      this
        .groupProvider
        .createGroupWithIcon(RequestParams)
        .then(data => {
          console.log(data);
          let res = JSON.stringify(data);
          let r = JSON.parse(res);
          console.log(JSON.stringify(r.status));
          let a = JSON.parse(r);
          console.log(a.status)
          if (a.status) {
            this
              .alertProvider
              .showAlert("Group Created");
            let nav = this
              .app
              .getRootNav();
            nav.setRoot("TabsPage", {tabIndex: 2});
          } else {
            this
              .alertProvider
              .showAlert("Try Again!");
          }
        }, err => {
          console.log(err);
        })
    }

  }

  /** without icon */
  simpleGroupCreation() {
    console.log(this.groupMembers);
    if (this.navParams.get('object').groupName == "") {
      this
        .alertProvider
        .showAlert("Please enter group name");
    } else if (this.navParams.get('object').groupType == "") {
      this
        .alertProvider
        .showAlert("Please choose group type");
    } else {

      let RequestParams = {
        group_name: this
          .navParams
          .get('object')
          .groupName,
        type: this
          .navParams
          .get('object')
          .groupType,
        user_ids_ar: this.groupMembers,
        admin_id: this.phoneNumberRegisterProvider.user_id,
        group_image: this
          .navParams
          .get('object')
          .groupIcon,
        lat: this.localDb.current_lat,
        lng: this.localDb.current_lng,
        place: this.localDb.current_location,
        description: this
          .navParams
          .get('object')
          .description
      }

      console.log("requestParams", RequestParams)
      this
        .groupProvider
        .createGroupWithoutIcon(RequestParams)
        .subscribe(createGroup => {
          console.log("success.........", createGroup);
          let respone = JSON.stringify(createGroup);
          let res = JSON.parse(respone);
          if (res.status == 1) {
            this
              .alertProvider
              .showAlert("Group Created");
            let nav = this
              .app
              .getRootNav();
            nav.setRoot("TabsPage", {tabIndex: 2});
          } else {
            this
              .alertProvider
              .showAlert(res.msg[0]);
          }

        })
    }

  }

  my_groups_contacts() {
    let all_ids = this
      .navParams
      .get('my_groupIds');
    let requestParams = {
      ids: all_ids
    };
  }

}
