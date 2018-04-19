import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';

import { LocalDatabaseProvider } from '../local-database/local-database';
import { ApiProvider } from '../api/api';
import { PhoneNumberRegisterProvider } from '../phone-number-register/phone-number-register';

declare var angular: any;
declare var require: any;
declare const Twilio: any;
@Injectable()
export class ContactsProvider {
  contacttobefound: any;
  contactsfound: any = [];
  contactDisplay: any = [];
  contactDuplicate: any = [];
  contactsWithoutSpace: any = [];
  friendsContacts: any = [];
  contactsWithoutCode: any = [];
  isRepeat: boolean = false;


  constructor(
    public http: Http,
    private contact: Contacts,
    public localDb: LocalDatabaseProvider,
    public apiProvider: ApiProvider,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider

  ) {
    //console.log('Hello ContactsProvider Provider');

  }


 
  // fetch contacts from mobile
  fetchContactsFromMobile() {
    return new Promise((resolve, reject) => {
      // fetch all contacts
      this.contact.find(['*'], { filter: "" }).then((contacts) => {
        let contactsfound = JSON.parse(JSON.stringify(contacts));
        console.log("contactsfound................",contactsfound);
        let validContacts = contactsfound.filter(x1 => x1._objectInstance.phoneNumbers != null);
      //  console.log("Contacts fetch from  mobile........", JSON.stringify(validContacts));
      
        // make array with elements name, phone number & photos with duplicates
        // also have removed special charaters and country code
        for (let c of validContacts) {
          if (c._objectInstance.phoneNumbers.length > 1)
            for (let i = 0; i < c._objectInstance.phoneNumbers.length; i++) {

              // this.contactDuplicate.push({ displayName: c._objectInstance.displayName, phoneNumbers: this.removeCountryCode(c._objectInstance.phoneNumbers[i].value.replace(/ |-|\(|\)/g, '')), photos: c._objectInstance.photos, isCheck: 0 })
              this.removeCountryCode(c._objectInstance.displayName, c._objectInstance.phoneNumbers[i].value.replace(/ |-|\(|\)/g, ''), c._objectInstance.photos);
            }
          else
            this.removeCountryCode(c._objectInstance.displayName, c._objectInstance.phoneNumbers[0].value.replace(/ |-|\(|\)/g, ''), c._objectInstance.photos);
          // this.contactDuplicate.push({ displayName: c._objectInstance.displayName, phoneNumbers: this.removeCountryCode(c._objectInstance.phoneNumbers[0].value.replace(/ |-|\(|\)/g, '')), photos: c._objectInstance.photos, isCheck: 0 })
        }

        let y = [];
        this.contactsfound = this.removeDuplicatePhoneNumbers(this.contactDuplicate);
        this.contactsfound.map(g1 => y.push(g1.phoneNumbers));

        this.fetchContactsFromServer({ 'mobile_no': y }).subscribe(data => {
         console.log("success.........", data);
          for (let x in this.contactsfound) {
            for (let y in data.data) {
              if (this.contactsfound[x].phoneNumbers == data.data[y].mobile_no) {
                this.friendsContacts.push({ displayName: this.contactsfound[x].displayName, phoneNumbers: this.contactsfound[x].phoneNumbers, photos: data.data[y].profile_picture, contact_id: data.data[y].id })
              }
            }
          }
           console.log("friends contatcts......", this.friendsContacts);
           
            for( var i=this.contactsfound.length - 1; i>=0; i--){
             for( var j=0; j<this.friendsContacts.length; j++){
            if(this.contactsfound[i] && (this.contactsfound[i].phoneNumbers === this.friendsContacts[j].phoneNumbers)){
              this.contactsfound.splice(i, 1);
            }
          }
      }
 
        console.log( this.contactsfound,"filteredData") ;    
        this.localDb.constactsLeft =  this.contactsfound;  
          // console.log("call to databse ");
          this.localDb.saveContactsInDb(this.friendsContacts);
          this.localDb.getContacts();
          resolve(true);
        }, err => {
          console.log("error........", err);
          reject(true);
        });
      })
    });
  }

  removeCountryCode(name, phoneNumber, photo) {
    //  console.log("number to be removed country code form.....",phoneNumber);
    if (phoneNumber.startsWith("+")) {
      this.contactDuplicate.push({ displayName: name, phoneNumbers: phoneNumber.substring(1), photos: photo, isCheck: 0 })
    } else if (phoneNumber.startsWith("0")) {
      let string1 = phoneNumber.substring(1);
      let string2 = this.phoneNumberRegisterProvider.country_code;
      let string3 = "" + string2 + string1;
      // console.log(string3)
      this.contactDuplicate.push({ displayName: name, phoneNumbers: string3, photos: photo, isCheck: 0 })
    } else {
      this.contactDuplicate.push({ displayName: name, phoneNumbers: phoneNumber, photos: photo, isCheck: 0 });
      this.contactDuplicate.push({ displayName: name, phoneNumbers: this.phoneNumberRegisterProvider.country_code + phoneNumber, photos: photo, isCheck: 0 });
    }

  }

  removeDuplicatePhoneNumbers(new_contacts) { // remove duplicate phone numbers
    return new_contacts.reduce((accumulator, current) => {
      return checkIfAlreadyExist(current) ? accumulator : [...accumulator, current];
      function checkIfAlreadyExist(currentVal) {
        return accumulator.some(item => item.phoneNumbers === currentVal.phoneNumbers);
      }
    }, []);
  }

  // fetch friends  contacts from server
  fetchContactsFromServer(body: Object) {
    //debugger;
    let bodyString = JSON.stringify(body);
   // console.log(bodyString);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this.apiProvider.stagingUrl + 'get_friends_list', body, options)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || error));
  }



}
