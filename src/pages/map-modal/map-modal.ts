import {Component, ViewChild, ElementRef} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';

import {LocalDatabaseProvider} from '../../providers/local-database/local-database';

declare var google : any;
@IonicPage()
@Component({selector: 'page-map-modal', templateUrl: 'map-modal.html'})
export class MapModalPage {
  @ViewChild('map')mapElement : ElementRef;
  map : any;
  constructor(public navCtrl : NavController, public navParams : NavParams, public geolocation : Geolocation, public localDb : LocalDatabaseProvider) {
    console.log(this.navParams.get('lat'), this.navParams.get('lng'));

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapModalPage');
    this.loadMap();
  }
  ionViewWillEnter() {

    this.placeMarker(this.navParams.get('lat'), this.navParams.get('lng'));
  }

  loadMap() {
    console.log("loadMap");

    let latLng = new google
      .maps
      .LatLng(this.navParams.get('lat'), this.navParams.get('lng'));

    let mapOptions = {
      center: latLng,
      zoom: 18,
      streetViewControl: false,
      disableDefaultUI: true

    }

    this.map = new google
      .maps
      .Map(this.mapElement.nativeElement, mapOptions);

  }

  /** palce marker of searcg location */
  placeMarker(lat, lng) {
    console.log(this.map);
    console.log(lat, lng);
    var lt = parseFloat(lat);
    var lg = parseFloat(lng);
    var pos = {
      lat: lt,
      lng: lg
    };
    console.log(pos);
    this
      .map
      .setCenter({lat: lt, lng: lg});

    var userMarker = new google
      .maps
      .Marker({position: pos, map: this.map});
  }

  /** close modal */
  goBack() {
    this
      .localDb
      .modal
      .dismiss();
  }
}
