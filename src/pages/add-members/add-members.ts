import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController} from 'ionic-angular';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

// import { CreateGroupSecondStepPage } from
// '../create-group-second-step/create-group-second-step';
import {ApiProvider} from '../../providers/api/api';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {ContactsProvider} from '../../providers/contacts/contacts';
import {AlertProvider} from '../../providers/alert/alert';
import {NetworkProvider} from '../../providers/network/network';
import {GroupProvider} from '../../providers/group/group';

@IonicPage()
@Component({selector: 'page-add-members', templateUrl: 'add-members.html'})
export class AddMembersPage {
  members : any = [];
  userId : any;
  defaultPage : any = 'my_contacts';
  distance : number;
  my_group_contact : any = [];
  my_group_around_me : any = [];
  groupMembers : any = [];
  contacts : any = [];
  constructor(public navCtrl : NavController, public navParams : NavParams, public modalCtrl : ModalController, private sanitizer : DomSanitizer, public contactsProvider : ContactsProvider, public apiProvider : ApiProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public alertProvider : AlertProvider, public localDb : LocalDatabaseProvider, public networkProvider : NetworkProvider, public groupProvider : GroupProvider) {

    this.contacts = this
      .navParams
      .get('group');
    this
      .localDb
      .getContacts();
    this.userId = this.phoneNumberRegisterProvider.user_id;
    this.distance = 10;
    this.getMyGroupContact();
    this.getAroundMeContact();

    console.log("localDb.contacts", this.localDb.contacts);
  }

  ionViewWillEnter() {

    console.log('ionViewDidLoad CreateGroupPage');
    this
      .contactsProvider
      .friendsContacts
      .map(c => (c.isCheck = false));

  }

  getMyGroupContact() {
    //debugger;
    let RequestParams = {
      group_ids: this
        .navParams
        .get('my_groupIds')
    };

    this
      .groupProvider
      .getMyGroupContact(RequestParams)
      .then(data => {
        this.my_group_contact = data;

        this
          .my_group_contact
          .map(c => (c.isCheck = false));

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

    this
      .groupProvider
      .getContactAroundMe(RequestParams)
      .then(data => {
        this.phoneNumberRegisterProvider.around_contact = data;
        console.log(":this.phoneNumberRegisterProvider.around_contact", this.phoneNumberRegisterProvider.around_contact);
        this
          .phoneNumberRegisterProvider
          .around_contact
          .map(c => (c.isCheck = false));

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

  addMembers(evt, index, comapre) {
    debugger;
    var not = true;
    for (let x in this.contacts) {
      if (evt.userId != undefined) {
        if (evt.userId == this.contacts[x].userId) {
          not = false;
        }
      } else {}
      if (evt.id == this.contacts[x].userId) {
        not = false;
      }

    }
    if (!not) {
      this
        .alertProvider
        .showAlert("Already added into group");
    } else {
      if (this.defaultPage == 'my_contacts') {
        if (!evt.isCheck) {
          this
            .members
            .push(evt);
          this.localDb.contacts[index].isCheck = true;
        }
      } else if (this.defaultPage == 'group_contacts') {
        if (!evt.isCheck) {
          this
            .members
            .push({isCheck: true, mobile_no: evt.mobile_no, name: evt.name, photo: evt.profile_picture, userId: evt.userId});
          this.my_group_contact[index].isCheck = true;
        }
      } else if (this.defaultPage == 'around_contacts') {
        if (!evt.isCheck) {
          this
            .members
            .push({isCheck: true, mobile_no: evt.mobile_no, name: evt.username, photo: evt.profile_picture, userId: evt.id});
          this.phoneNumberRegisterProvider.around_contact[index].isCheck = true;
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

  }

  removeMember(evt, index) {

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

  my_groups_contacts() {
    let all_ids = this
      .navParams
      .get('my_groupIds');
    let requestParams = {
      ids: all_ids
    };
  }

  /** add members to group*/
  addMembersToGroup() {
    var detail = this
      .navParams
      .get('group_detail');
    console.log("group_detail", this.navParams.get('group_detail'));
    if (this.networkProvider.isOffline()) {
      this
        .alertProvider
        .showAlert("No internet!")
    } else {
      for (let m in this.members) {
        this
          .groupMembers
          .push({user_id: this.members[m].userId})
      }
      let requestParams = {
        group_id: detail.id,
        user_ids_ar: this.groupMembers,
        status: 0
      }

      var group = {
        id: detail.id,
        group_image: detail.group_image,
        group_name: detail.group_name,
        date_added: detail.date_added,
        member_count: detail.member_count,
        is_admin: detail.is_admin
      }
      this
        .groupProvider
        .AddGroupMembers(requestParams)
        .subscribe(data => {
          this
            .alertProvider
            .showAlert("Memberadded ")
          this
            .navCtrl
            .push("GroupDetailPage", {group: group})
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
            })
        }, err => {
          console.log(err);
          this
            .alertProvider
            .showAlert("Server not responding")
        })
    }
  }
}