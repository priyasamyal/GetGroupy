import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  ActionSheetController,
  Platform,
  LoadingController,
  IonicPage,
  App,
  Tabs,
  AlertController,
} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';

import {GroupEditModel} from './group-edit.model';

import {GroupProvider} from '../../providers/group/group';
import {AlertProvider} from '../../providers/alert/alert';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {NetworkProvider} from '../../providers/network/network';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';
declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-group-edit',
  templateUrl: 'group-edit.html',
})
export class GroupEditPage {
  public groupEditModel = new GroupEditModel('', '', '', [], false);
  is_admin: any;
  createdAt: any;
  member_count: any;
  group_image: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public file: File,
    public filePath: FilePath,
    public platform: Platform,
    private sanitizer: DomSanitizer,
    public loadingCtrl: LoadingController,
    public app: App,
    public tab: Tabs,
    public groupProvider: GroupProvider,
    public alertProvider: AlertProvider,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider,
    public networkProvider: NetworkProvider,
    public localDb: LocalDatabaseProvider,
    public apiProvider: ApiProvider
  ) {
    let group = this.navParams.get('group');
    console.log(group);
    this.groupEditModel.groupId = group.id;
    this.groupEditModel.groupName = group.group_name;
    this.createdAt = group.date_added;
    this.member_count = group.member_count;
    if (group.group_image == 'no_image.jpeg') {
      this.groupEditModel.groupIconDisplay = false;
    } else if (group.group_image.startsWith('file')) {
      this.groupEditModel.groupIcon = group.group_image;
    } else {
      this.groupEditModel.groupIcon =
        this.apiProvider.imageUrl + '/' + group.group_image;
      this.groupEditModel.groupIconDisplay = true;
    }
    this.group_image = this.groupEditModel.groupIcon;
    this.is_admin = group.is_admin;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupEditPage');
  }

  getPicture(image) {
    return this.sanitizer.bypassSecurityTrustUrl(image);
  }

  /** choose group icon */
  chooseGroupIcon() {
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

  // Create options for the Camera Dialog
  public takePicture(sourceType) {
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
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(
              imagePath.lastIndexOf('/') + 1,
              imagePath.lastIndexOf('?')
            );
            this.copyFileToLocalDir(
              correctPath,
              currentName,
              this.createFileName()
            );
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
    let loading = this.loadingCtrl.create({content: 'Please Wait...'}); // loader create
    loading.present(); // loading present
    console.log('copyFileToLocalDir');
    this.file
      .copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
      .then(
        success => {
          this.groupEditModel.groupIcon =
            cordova.file.dataDirectory + newFileName;
          console.log(
            'image path..............',
            this.groupEditModel.groupIcon
          );
          this.groupEditModel.groupIconDisplay = true;
          loading.dismiss();
        },
        error => {
          loading.dismiss(); // loading dismiss
          console.log('Error while storing file');
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

  /** create group */
  editGroup() {
    //debugger;
    if (this.groupEditModel.groupIcon != this.group_image) {
      this.groupCreationWithIcon();
    } else {
      this.simpleGroupCreation();
    }
  }

  /**with icon */
  groupCreationWithIcon() {
    if (this.networkProvider.isOffline()) {
      this.alertProvider.showAlert('No internet!');
    } else {
      let RequestParams = {
        group_id: this.groupEditModel.groupId,
        group_name: this.groupEditModel.groupName,
        group_image: this.groupEditModel.groupIcon,
      };
      this.groupProvider.editGroupWithIcon(RequestParams).then(
        data => {
          console.log(data);
          let res = JSON.stringify(data);
          let r = JSON.parse(res);
          let a = JSON.parse(r);
          if (a.status) {
            this.alertProvider.showAlert('Group edited');

            var group = {
              id: this.groupEditModel.groupId,
              group_image: this.groupEditModel.groupIcon,
              group_name: this.groupEditModel.groupName,
              date_added: this.createdAt,
              member_count: this.member_count,
              is_admin: this.is_admin,
              group_name_he: 'hebrew',
            };
            console.log(group);
            this.navCtrl
              .push('GroupDetailPage', {
                group: group,
              })
              .then(() => {
                const index = this.navCtrl.getActive().index;
                this.navCtrl.remove(index - 1);
                this.navCtrl.remove(index - 2);
              });
          } else {
            this.alertProvider.showAlert('Try Again!');
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  /** without icon */
  simpleGroupCreation() {
    let RequestParams = {
      group_id: this.groupEditModel.groupId,
      group_name: this.groupEditModel.groupName,
      group_name_he: 'hebrew',
    };
    let editGroupOperation: Observable<GroupEditModel[]>;

    this.groupProvider
      .editGroupWithoutIcon(RequestParams)
      .subscribe(createGroup => {
        console.log('success.........', createGroup);
        let respone = JSON.stringify(createGroup);
        let res = JSON.parse(respone);
        if (res.status == 1) {
          this.alertProvider.showAlert('Group Edited');
          var group = {
            id: this.groupEditModel.groupId,
            group_image: this.groupEditModel.groupIcon,
            group_name: this.groupEditModel.groupName,
            date_added: this.createdAt,
            member_count: this.member_count,
            is_admin: this.is_admin,
          };
          console.log(group);
          this.navCtrl
            .push('GroupDetailPage', {
              group: group,
            })
            .then(() => {
              const index = this.navCtrl.getActive().index;
              this.navCtrl.remove(index - 1);
              this.navCtrl.remove(index - 2);
            });
        } else {
          this.alertProvider.showAlert(res.msg[0]);
        }
      });
  }

  /** exit from group */
  exitFromGroup(group_id, is_admin) {
    if (this.networkProvider.isOffline()) {
      this.alertProvider.showAlert('No internet!');
    } else {
      // if (is_admin) {
      //   this.alertProvider.showAlert("Being admin,You cant leave group")
      // } else {
      this.showConfirm(group_id);

      // }
    }
  }

  showConfirm(group_id) {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to exit this group?',
      message:
        'If you delete yourself from this group, you will no longer be able to send/recieve messages from this group.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          },
        },
        {
          text: 'Ok',
          handler: () => {
            console.log('Agree clicked');
            let requestParams = {
              group_id: group_id,
              user_id: this.phoneNumberRegisterProvider.user_id,
            };
            this.groupProvider.ExitGroup(requestParams).subscribe(
              data => {
                console.log(data);
                let nav = this.app.getRootNav();
                nav.setRoot('TabsPage', {tabIndex: 2});
              },
              err => {
                console.log(err);
                this.alertProvider.showAlert('Server not responding');
              }
            );
          },
        },
      ],
    });
    confirm.present();
  }
}
