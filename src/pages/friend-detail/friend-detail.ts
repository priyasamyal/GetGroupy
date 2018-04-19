import {Component} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
} from 'ionic-angular';

import {AlertProvider} from '../../providers/alert/alert';
import {ApiProvider} from '../../providers/api/api';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {ProfileProvider} from '../../providers/profile/profile';
import {RequestOptions} from '\@angular/http';
@IonicPage()
@Component({selector: 'page-friend-detail', templateUrl: 'friend-detail.html'})
export class FriendDetailPage {
  friend_data = {
    about: '',
    date_added: '',
    last_seen: '',
    mobile_no: '',
    profile_picture: '',
    username: '',
    
  };
  myId;

  bgImage;
  is_blocked;
  block_status="Block or Report a Spam";
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public apiProvider: ApiProvider,
    public profileProvider: ProfileProvider,
    public alertCtrl: AlertController,
    public alertProvider : AlertProvider,
    public phoneNumberRegisterProvider : PhoneNumberRegisterProvider
  ) {
    this
    .phoneNumberRegisterProvider
    .getUser()
    .then(data => {
      console.log("user data.........", data);
      this.myId = data.id;
      
    }, err => {
      console.log(err);

    })
  }

  

  ionViewDidLoad() {
    this.is_blocked=  this.phoneNumberRegisterProvider.getUserBlockStatus();
    if(this.is_blocked.blocking_user_id == this.phoneNumberRegisterProvider.user_id){
     
         this.block_status="Unblock"
    }
   
    console.log('ionViewDidLoad FriendDetailPage',this.is_blocked);
    let id = this.navParams.get('user_id');
    let requstParam = {
      user_id: this.navParams.get('user_id'),
    };

    this.profileProvider.viewFriendProfile(requstParam).subscribe(
      data => {
        this.friend_data = data.data[0];
        console.log(this.friend_data, 'friendData');
        if (this.friend_data.profile_picture == '' || this.friend_data.profile_picture == null ) {
          var img = 'assets/no-user.png';
          this.bgImage = 'url(' + img + ')';
        } else {
          this.bgImage =
            'url(' +
            this.apiProvider.imageUrl +
            this.friend_data.profile_picture +
            ')';
        }
      },
      err => {
        console.log(err, 'erroer');
      }
    );
  }

  block_user() {

     if(this.is_blocked.blocked_user_id ==  this.phoneNumberRegisterProvider.user_id){
      this.alertProvider.showAlert("You can't block this user as user already blocked you")
   }


   else if(this.is_blocked.blocking_user_id == this.phoneNumberRegisterProvider.user_id){
      this.alertProvider.confirm_unblock('Unblock '+ this.friend_data.username+' to send Message').then(
        data=>{
          console.log(data)
          this.unblock_contact();
        },err=>{
          console.log(err,"error")
        }
      )

    }
    else{
      console.log('block user');
      this.alertProvider.confirm( 'Block ' + this.friend_data.username + ' ?', 'Blocked contacts will no longer be able to send you messages').then(
        data=>{
          console.log(data)
          this.on_block_contact();
        },err=>{
          console.log(err,"error")
        }
      )
    }
   
  }

  goChatView() {
    console.log('fg');
    this.navCtrl.pop();
  }

  on_block_contact() {
    let requestParam = {
      user_id :this.myId,
      blocked_user_id : this.navParams.get('user_id'),
    };
    console.log(requestParam)
    this.profileProvider.block_contact(requestParam).subscribe(
      data => {
        this.phoneNumberRegisterProvider.setUserBlockStatus({blocked_user_id:this.navParams.get('user_id'),blocking_user_id:this.phoneNumberRegisterProvider.user_id});
        this.block_status="Unblock"
        console.log(data);
        if(data.status){
          this.alertProvider.showAlert("User Blocked")
        }
      },
      err => {
        console.log(err);
      }
    );
  }

   /** Unblock Contact */
   unblock_contact(){
    let requestParam = {
      user_id :this.phoneNumberRegisterProvider.user_id,
      blocked_user_id :this.navParams.get('user_id'),
    };
    console.log(requestParam)
    this.profileProvider.unblock_contact(requestParam).subscribe(
      data => {
        console.log(data);
        this.block_status="Block or Report a Spam";
        this.phoneNumberRegisterProvider.setUserBlockStatus({blocked_user_id:null,blocking_user_id:null});
      
       },
      err => {
        console.log(err);
      }
    );
  }

 
}
