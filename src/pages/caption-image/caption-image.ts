import {Component, ElementRef} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

@IonicPage()
@Component({selector: 'page-caption-image', templateUrl: 'caption-image.html'})
export class CaptionImagePage {
  event : any;
  title_image : any;
  constructor(public navCtrl : NavController, public navParams : NavParams, public element : ElementRef) {
    this.event = this
      .navParams
      .get('event');
    this.title_image = this
      .navParams
      .get('title_image');
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad CaptionImagePage');
    console.log(this.event);
    if (this.event) {
      var reader = new FileReader();
      var image = this
        .element
        .nativeElement
        .querySelector('.image');
      reader.onload = function (e) {
        var src = e.target['result'];
        image.src = src;
      };
      reader.readAsDataURL(this.event.target.files[0]);
    }

  }

  closeModal() {
    this
      .navCtrl
      .pop();
  }

}
