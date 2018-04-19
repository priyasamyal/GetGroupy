import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, IonicPage, Searchbar } from 'ionic-angular';


//import { RegistrationPage } from '../registration/registration';

import { PhoneNumberRegisterProvider } from '../../providers/phone-number-register/phone-number-register';

@IonicPage()

@Component({
  selector: 'page-choose-country',
  templateUrl: 'choose-country.html',
})
export class ChooseCountryPage {
  @ViewChild('searchbar') searchbar: Searchbar;
  countryCodes: any;
  hide: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider
  ) {
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad ChooseCountryPage');
    console.log(this.phoneNumberRegisterProvider.countryCodes);
    this.countryCodes = this.phoneNumberRegisterProvider.countryCodes;
  }

  // choose code nad go back to register

  chooseCode(code) {
    this.navCtrl.setRoot("RegistrationPage", { code: code, username: this.navParams.get('username'), mobileno: this.navParams.get('mobileno') });
  }

  // show searchbar
  searchCountry(ev) {
    this.hide = true;
    setTimeout(() => {
      this.searchbar.setFocus();
    });
  }

  // search country
  getItems(ev) {
    // Reset items back to all of the items
    this.countryCodes = this.phoneNumberRegisterProvider.countryCodes;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.countryCodes = this.countryCodes.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  // hide searchbar
  cancel() {
    this.hide = false;
    this.countryCodes = this.phoneNumberRegisterProvider.countryCodes;
  }

}
