import {Component} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  LoadingController,
  AlertController,
} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';
import {Crop} from '@ionic-native/crop';

import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';
import {ProfileProvider} from '../../providers/profile/profile';
import {AlertProvider} from '../../providers/alert/alert';
import {NetworkProvider} from '../../providers/network/network';
import {RequestOptions} from '\@angular/http';

declare var cordova: any;

@IonicPage()
@Component({selector: 'page-user-profile', templateUrl: 'user-profile.html'})
export class UserProfilePage {
  profilePic: any;
  user_name: any;
  mobile_no: any;
  nickname:any;
  user_about: any;
  constructor(
    public navCtrl: NavController,
    public profileProvider: ProfileProvider,
    public alertCtrl: AlertController,
    public crop: Crop,
    public actionSheetCtrl: ActionSheetController,
    public camera: Camera,
    private file: File,
    private filePath: FilePath,
    public platform: Platform,
    private loadingCtrl: LoadingController,
    public alertProvider: AlertProvider,
    public networkProvider: NetworkProvider,
    public localDb: LocalDatabaseProvider,
    public apiProvider: ApiProvider,
    public navParams: NavParams,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider
  ) {
    // this.phoneNumberRegisterProvider.status = "****** No Status ******";
    // this.profilePic = "assets/no-user.png"; this   .localDb   .popover
    // .dismiss();
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad UserProfilePage');
    this.phoneNumberRegisterProvider.getUser().then(
      data => {
        console.log('user data.........', data,data.profile_picture);
        this.user_name = data.username;
        this.mobile_no = data.mobile_no;
        this.nickname=data.nickname;
        if (data.profile_picture == null) {
          console.log("without image")
          this.profilePic = 'assets/no-user.png';
        } else {
          console.log("with image")
          this.profilePic = this.apiProvider.imageUrl + data.profile_picture;
        }
        if (data.about == null) {
          this.user_about = '****** No Status ******';
        } else {
          this.user_about = data.about;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // Used to open camera through camera plugin
  getPicture() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          },
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    actionSheet.present();
  }

  //take a picture with the camera
  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };

    // Get the data of an image
    this.camera.getPicture(options).then(
      imagePath => {
        // Special handling for Android library
        if (
          this.platform.is('android') &&
          sourceType === this.camera.PictureSourceType.PHOTOLIBRARY
        ) {
          this.filePath.resolveNativePath(imagePath).then(filePath => {
            console.log(imagePath);
            let options = {
              quality: 75,
              widthRatio: 2,
              heightRatio: 1,
              targetWidth: 900,
              targetHeight: 100,
            };

            this.crop.crop(imagePath, options).then(newImage => {
              console.log(newImage, 'newImagefilepaath1');
              this.filePath.resolveNativePath(newImage).then(filePath1 => {
                console.log(filePath1, 'filepaath1');
                let correctPath = filePath1.substr(
                  0,
                  filePath.lastIndexOf('/') + 1
                );
                let currentName = newImage.substring(
                  newImage.lastIndexOf('/') + 1,
                  newImage.lastIndexOf('?')
                );
                this.copyFileToLocalDir(
                  correctPath,
                  currentName,
                  this.createFileName()
                );
              });
            });
          });
        } else {
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.copyFileToLocalDir(
            correctPath,
            currentName,
            this.createFileName()
          );
        }
      },
      err => {
        console.log('Error while selecting image');
      }
    );
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    let loading = this.loadingCtrl.create({content: 'Please Wait...'}); //loader create
    loading.present(); // loading present
    console.log('copyFileToLocalDir');
    this.file
      .copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
      .then(
        success => {
          loading.dismiss(); // loading dismiss
          this.profilePic = cordova.file.dataDirectory + newFileName;
          console.log(cordova.file.dataDirectory + newFileName, 'name');
          console.log(this.profilePic);
          let requestParams = {
            profile_picture: this.profilePic,
            user_id: this.phoneNumberRegisterProvider.user_id,
          };
          console.log('request Params', requestParams);
          this.profileProvider.editProfileIcon(requestParams).then(
            data => { 
              let res = JSON.stringify(data);
              let r = JSON.parse(res);
              console.log(JSON.stringify(r.data));
              let a = JSON.parse(r);
              console.log(a.data.profile_picture)
              this.phoneNumberRegisterProvider.getUser().then(
                data => {
                  console.log('user data.........', data);
                
                  let new_user = {
                    about: data.about,
                    country_code: data.country_code,
                    date_added: data.date_added,
                    id: data.id,
                    is_active: data.is_active,
                    is_online: data.is_online,
                    is_verified: data.is_verified,
                    last_seen: data.last_seen,
                    mobile_no: data.mobile_no,
                    profile_picture: a.data.profile_picture,
                    username: data.username,
                    verification_token: data.verification_token,
                  };
                  console.log(new_user,"usernew")
                  this.phoneNumberRegisterProvider.setUser(new_user);
          
                  this.navCtrl.pop();
                  // this   .navCtrl   .push("UserProfilePage");
                },
                err => {
                  console.log(err);
                }
              );
              this.alertProvider.showAlert('Profile Image Updated');
            },
            err => {
              console.log(err, 'error saving image');
              this.alertProvider.showAlert('Serve not responding');
            }
          );
        },
        error => {
          loading.dismiss();
          console.log('Error while storing image');
        }
      );
  }

  // Create a new name for the image
  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + '.jpg';
    return newFileName;
  }

  /** edit profile */
  showPrompt() {
    this.navCtrl.push('EditProfilePage');
  }
}
