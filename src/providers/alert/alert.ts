import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {AlertController} from 'ionic-angular';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {GroupProvider} from '../../providers/group/group';
@Injectable()
export class AlertProvider {

  constructor(public http : Http, public alertCtrl : AlertController, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public groupProvider : GroupProvider,) {

    console.log('Hello AlertProvider Provider');
  }

  showAlert(msg) {
    let alert = this
      .alertCtrl
      .create({title: 'GetGroupy', subTitle: msg, buttons: ['OK']});
    alert.present();
  }

  confirm(title, msg) {
    return new Promise((resolve, reject) => {
      let alert = this
        .alertCtrl
        .create({
          title: title,
          message: msg,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
                reject(false)
              }
            }, {
              text: 'Block',
              handler: () => {
                console.log('Buy clicked');
                resolve(true)
              }
            }
          ]
        });
      alert.present();
    })

  }

  confirm_unblock(msg) {
    return new Promise((resolve, reject) => {
      let alert = this
        .alertCtrl
        .create({
          title: 'GetGroupy',
          message: msg,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
                reject(false)
              }
            }, {
              text: 'Unblock',
              handler: () => {
                console.log('Buy clicked');
                resolve(true)
              }
            }
          ]
        });
      alert.present();
    })

  }
  join_confirm(msg, text1, text2) {
    return new Promise((resolve, reject) => {
      let alert = this
        .alertCtrl
        .create({
          message: msg,
          buttons: [
            {
              text: text1,
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
                reject(false)
              }
            }, {
              text: text2,
              handler: () => {
                console.log('Buy clicked');
                resolve(true)
              }
            }
          ]
        });
      alert.present();
    })

  }

}
