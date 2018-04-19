import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {ProfileProvider} from '../../providers/profile/profile';
import {AlertProvider} from '../../providers/alert/alert';
import {GroupProvider} from '../../providers/group/group';
import {NetworkProvider} from '../../providers/network/network';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';

@IonicPage()
@Component({selector: 'page-edit-profile', templateUrl: 'edit-profile.html'})
export class EditProfilePage {
  user_name : string;
  user_about : string;
  nickname : string;
  constructor(public navCtrl : NavController, public profileProvider : ProfileProvider, public navParams : NavParams, public alertProvider : AlertProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public groupProvider : GroupProvider, public networkProvider : NetworkProvider, public localDb : LocalDatabaseProvider, public apiProvider : ApiProvider) {
    this
      .phoneNumberRegisterProvider
      .getUser()
      .then(data => {
        console.log("user data.........", data);
        this.user_name = data.username;
        this.user_about = data.about;
        this.nickname = data.nickname;
      }, err => {
        console.log(err);

      })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProfilePage');
  }

  /** edit profile data */
  editProfile() {
    if (this.networkProvider.isOffline()) {
      this
        .alertProvider
        .showAlert('No internet!')
    } else {
      let requestParams = {
        username: this.user_name,
        about: this.user_about,
        nickname: this.nickname,
        user_id: this.phoneNumberRegisterProvider.user_id
      }
      this
        .profileProvider
        .editProfile(requestParams)
        .subscribe(data => {
          console.log("editProfile", data);
          var res = data;
          this
            .phoneNumberRegisterProvider
            .getUser()
            .then(data => {
              console.log("user data.........", data);
              console.log("new user data.........", res.data);
              let new_user = {
                about: res.data.about,
                country_code: data.country_code,
                date_added: data.date_added,
                id: data.id,

                is_active: data.is_active,
                is_online: data.is_online,
                is_verified: data.is_verified,
                last_seen: data.last_seen,
                mobile_no: data.mobile_no,
                profile_picture: data.profile_picture,
                username: res.data.username,
                nickname: res.data.nickname,
                verification_token: data.verification_token
              }
              console.log("new user new_user.........", new_user);
              this
                .phoneNumberRegisterProvider
                .setUser(new_user);
              this
                .alertProvider
                .showAlert("Profile updated!!");
              this
                .navCtrl
                .pop();
              this
                .navCtrl
                .push("UserProfilePage")
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
            }, err => {
              console.log(err);

            })
        }, err => {
          console.log("editProfile", err)
          this
            .alertProvider
            .showAlert('Server is not responding')
        })
    }

  }

}
