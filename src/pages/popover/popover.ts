import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, IonicPage } from 'ionic-angular';

import { ContactsProvider } from '../../providers/contacts/contacts';
import { LocalDatabaseProvider } from '../../providers/local-database/local-database';

@IonicPage()
@Component({
  selector: 'page-popover',
  template: `
    <ion-list>
     <button ion-item (click)="doRefresh()">Refresh</button>
      <button ion-item>Invite Friends</button>
    </ion-list>
  `
})
export class PopoverPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public localDb: LocalDatabaseProvider,
    public contactsProvider: ContactsProvider) {
    this.contactsProvider.fetchContactsFromMobile().then(data => {
     this.localDb.getContacts();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopoverPage');
  }


  // refresh contacts again
  doRefresh() {
    this.contactsProvider.contactsfound = [];
    this.contactsProvider.friendsContacts = [];
    this.localDb.getContacts();
    this.viewCtrl.dismiss();
  }
}
