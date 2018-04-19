import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  LoadingController,
  IonicPage,
  App,
  Tabs
} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

import {CreateGroupSecondStepModel} from './create-group-second-step.model';
//import { MyGroupsPage } from '../my-groups/my-groups';

import {GroupProvider} from '../../providers/group/group';
import {AlertProvider} from '../../providers/alert/alert';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {NetworkProvider} from '../../providers/network/network';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';

declare var cordova : any;

@IonicPage()
@Component({selector: 'page-create-group-second-step', templateUrl: 'create-group-second-step.html'})
export class CreateGroupSecondStepPage {
  public createGroupSecondStepModel = new CreateGroupSecondStepModel("", "", "", "", [], false);
  totalMembers : any;
  groupMembers : any = [];
  description : any = "";
  constructor(public navCtrl : NavController, public navParams : NavParams, private camera : Camera, public actionSheetCtrl : ActionSheetController, public file : File, public filePath : FilePath, public platform : Platform, private sanitizer : DomSanitizer, public loadingCtrl : LoadingController, public app : App, public tab : Tabs, public groupProvider : GroupProvider, public alertProvider : AlertProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public networkProvider : NetworkProvider, public localDb : LocalDatabaseProvider, public apiProvider : ApiProvider) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateGroupSecondStepPage');

  }

  getPicture(image) {
    return this
      .sanitizer
      .bypassSecurityTrustUrl(image);
  }

  /** choose group icon */
  chooseGroupIcon() {

    let actionSheet = this
      .actionSheetCtrl
      .create({
        title: 'Select Image Source',
        buttons: [
          {
            text: 'Load from Library',
            handler: () => {
              this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
            }
          }, {
            text: 'Use Camera',
            handler: () => {
              this.takePicture(this.camera.PictureSourceType.CAMERA);
            }
          }, {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
    actionSheet.present();
  }

  // Create options for the Camera Dialog
  public takePicture(sourceType) {

    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: true,
      correctOrientation: true
    };

    // Get the data of an image
    this
      .camera
      .getPicture(options)
      .then((imagePath) => {
        // Special handling for Android library
        if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this
            .filePath
            .resolveNativePath(imagePath)
            .then(filePath => {
              let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
              let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
              this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
            });
        } else {
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        }
      }, (err) => {
        console.log('Error while selecting image');
      });
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    let loading = this
      .loadingCtrl
      .create({content: 'Please Wait...'}) // loader create
    loading.present(); // loading present
    console.log("copyFileToLocalDir");
    this
      .file
      .copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
      .then(success => {
        this.createGroupSecondStepModel.groupIcon = cordova.file.dataDirectory + newFileName;
        console.log("image path..............", this.createGroupSecondStepModel.groupIcon);
        this.createGroupSecondStepModel.groupIconDisplay = true;
        loading.dismiss();
      }, error => {
        loading.dismiss(); // loading dismiss
        console.log('Error while storing file');
      });
  }

  // Create a new name for the image
  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  /** create group */
  createGroup() {
    console.log(this.createGroupSecondStepModel);
    if (this.createGroupSecondStepModel.groupName && this.createGroupSecondStepModel.groupType != "") {
      this
        .navCtrl
        .push('CreateGroupPage', {
          object: this.createGroupSecondStepModel,
          my_groupIds: this
            .navParams
            .get('my_groupIds')
        })
    } else {
      this
        .alertProvider
        .showAlert("Group Name and Group Type is mandatory to create a new group!")
    }

  }
}
