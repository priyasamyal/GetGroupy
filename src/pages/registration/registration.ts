import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  IonicPage,
} from 'ionic-angular';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Geolocation} from '@ionic-native/geolocation';

import {RegisterModel} from './register.model';
import {VerifyOTPModel} from '../../pages/registration/verifyOtp.model';

import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {AlertProvider} from '../../providers/alert/alert';
import {ContactsProvider} from '../../providers/contacts/contacts';
import {ChatsProvider} from '../../providers/chats/chats';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';

declare var google: any;
// declare var require: any;
// const translate = require('google-translate-api');
@IonicPage()
@Component({selector: 'page-registration', templateUrl: 'registration.html'})
export class RegistrationPage {
  public registerModel = new RegisterModel('', '');
  public verifyOTPModel = new VerifyOTPModel(0);
  country_name = '';
  selected_country;
  constructor(
    private geolocation: Geolocation,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider,
    public alertProvider: AlertProvider,
    public contactsProvider: ContactsProvider,
    public chatsProvider: ChatsProvider,
    public localDb: LocalDatabaseProvider
  ) {
    //console.log(translate, 'Translat...e');
    let code = this.navParams.get('code');
    // set country & code
    console.log(code);

    if (code != undefined) {
      console.log('enter if');
      let response = code;
      this.phoneNumberRegisterProvider.code = '+' + response.code;
      this.phoneNumberRegisterProvider.country_name = response.name;
    } else {
      //this.getCountry();
      console.log(this.phoneNumberRegisterProvider.code);
      //  this.registerModel.code = this.phoneNumberRegisterProvider.code;
    }

    if (this.navParams.get('username') != undefined) {
      console.log('enter if');
      this.registerModel.username = this.navParams.get('username');
    }

    if (this.navParams.get('mobileno') != undefined) {
      console.log('enter if');
      this.registerModel.phoneNumber = this.navParams.get('mobileno');
    }
  }

  getCountry() {
    debugger;
    this.geolocation.getCurrentPosition().then(resp => {
      let lat, lng;
      lat = 31.0461;
      lng = 34.8516;
      lat = resp.coords.latitude;
      lng = resp.coords.longitude;

      let geocoder = new google.maps.Geocoder();
      let latlng = new google.maps.LatLng(lat, lng);
      let request = {
        latLng: latlng,
      };
      console.log(request, 'new');
      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          console.log(results, 'results');
          if (results[0]) {
            var components = results[0].address_components;

            for (
              var component = 0;
              component < components.length;
              component++
            ) {
              if (components[component].types[0] == 'country') {
                this.country_name = components[component].long_name;
                console.log(
                  'country is in Registration PAge',
                  this.country_name
                );
                this.displayCountry();
              }
            }
          }
        }
      });
    });
  }

  displayCountry() {
    this.selected_country = this.phoneNumberRegisterProvider.countryCodes.filter(
      country => country.name == this.country_name
    );
    console.log(this.selected_country, 'selected country');
    this.phoneNumberRegisterProvider.code = '+' + this.selected_country[0].code;
    this.phoneNumberRegisterProvider.country_name = this.selected_country[0].name;
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad RegistrationPage');
  }

  chooseCountry() {
    // navigate to choose country page
    this.navCtrl.push('ChooseCountryPage', {
      username: this.registerModel.username,
      mobileno: this.registerModel.phoneNumber,
    });
  }

  registerPhoneNumber(): void {
    console.log('register number');
    if (this.registerModel.username == '') {
      this.alertProvider.showAlert('UserName is required!');
    } else if (this.phoneNumberRegisterProvider.country_name == '') {
      this.alertProvider.showAlert('Country is required!');
    } else if (this.registerModel.phoneNumber == '') {
      this.alertProvider.showAlert('Phone number is required!');
    } else {
      let registrationOperation: Observable<RegisterModel[]>;
      let requestParams = {
        username: this.registerModel.username,
        mobile_no:
          this.phoneNumberRegisterProvider.code.substring(1) +
          this.registerModel.phoneNumber,
        country_code: this.phoneNumberRegisterProvider.code.substring(1),
        lat: this.localDb.current_lat,
        lng: this.localDb.current_lng,
        place: this.localDb.current_location,
        device_token: this.localDb.device_token,
        nickname:'Anonamyus',
        //  username_he: 'פרייה',
      };
      console.log('req', requestParams);
      registrationOperation = this.phoneNumberRegisterProvider.registerPhoneNumber(
        requestParams
      );
      registrationOperation.subscribe(
        register => {
          console.log('success.........', register);
          let respone = JSON.stringify(register);
          let res = JSON.parse(respone);
          this.phoneNumberRegisterProvider.country_code = this.phoneNumberRegisterProvider.code.substring(
            1
          );
          this.contactsProvider.contactsfound = [];
          this.contactsProvider.fetchContactsFromMobile();
          this.localDb.getContacts();
          if (res.status == 1) {
            this.showPrompt(
              this.registerModel.phoneNumber,
              this.phoneNumberRegisterProvider.code.substring(1)
            );
          } else {
            if (res.msg[0] == 'Mobile Number already exists') {
              this.phoneNumberRegisterProvider.setUser(res.data[0]);
              this.phoneNumberRegisterProvider.user_id = res.data[0].id;
              this.phoneNumberRegisterProvider.user_name = res.data[0].username;
              this.phoneNumberRegisterProvider.nickname = res.data[0].nickname;
              this.phoneNumberRegisterProvider.mobile_no =
                res.data[0].mobile_no;
              this.navCtrl.setRoot('TabsPage');
            } else {
              // this.alertProvider.showAlert(res.msg[0]);
              if (res.groupname != undefined)
                this.alertProvider.showAlert('Invalid mobile number');
              else this.alertProvider.showAlert(res.msg[0]);
            }
          }
        },
        err => {
          // Log errors if any
          console.log('erro..........', err);
          if (typeof err == 'string') this.alertProvider.showAlert(err);
          else this.alertProvider.showAlert('Server not responding');
        }
      );
    }
  }

  showPrompt(mobile_no, country_code) {
    let prompt = this.alertCtrl.create({
      title: 'GetGroupy',
      message:
        'Enter OTP send at your number or you will recieve a call for OTP',
      inputs: [
        {
          name: 'otp',
          placeholder: 'Enter OTP',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          },
        },
        {
          text: 'Ok',
          handler: data => {
            console.log('Saved clicked');
            let verificationOperation: Observable<VerifyOTPModel[]>;
            let requestParams = {
              verification_code: data.otp,
              mobile_no: country_code + mobile_no,
            };
            verificationOperation = this.phoneNumberRegisterProvider.verifyOTP(
              requestParams
            );
            verificationOperation.subscribe(
              verify => {
                console.log('success.........', verify);
                let respone = JSON.stringify(verify);
                let res = JSON.parse(respone);
                console.log(res);
                // this.chatsProvider.getChatLists({ user_id: res.data[0].id }).subscribe(data
                // => {   console.log(data);   this.localDb.saveChatList(data.data); }, err => {
                //   console.log(err); })
                if (res.status) {
                  this.phoneNumberRegisterProvider.setUser(res.data[0]);
                  this.phoneNumberRegisterProvider.user_id = res.data[0].id;
                  this.phoneNumberRegisterProvider.user_name =
                    res.data[0].username;
                  this.phoneNumberRegisterProvider.country_code =
                    res.data[0].country_code;
                  this.phoneNumberRegisterProvider.nickname =
                    res.data[0].nickname;
                  this.phoneNumberRegisterProvider.mobile_no =
                    res.data[0].mobile_no;
                  this.alertProvider.showAlert(res.msg);
                  this.navCtrl.setRoot('TabsPage');
                } else {
                  this.againOpenPrompt();
                  this.alertProvider.showAlert(res.msg[0]);
                }
              },
              err => {
                // Log errors if any
                console.log('erro..........', err);
                this.alertProvider.showAlert(err);
              }
            );
          },
        },
      ],
    });
    prompt.present();
  }

  againOpenPrompt() {
    this.showPrompt(
      this.registerModel.phoneNumber,
      this.phoneNumberRegisterProvider.code.substring(1)
    );
  }
}
