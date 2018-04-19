import {NgModule, ErrorHandler, ViewChild} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {
  Nav,
  IonicApp,
  IonicModule,
  IonicErrorHandler,
  App,
} from 'ionic-angular';
import {MomentModule} from 'angular2-moment';
import {HttpModule} from '@angular/http';
import {Contacts} from '@ionic-native/contacts';
import {NativeStorage} from '@ionic-native/native-storage';
import {MyApp} from './app.component';
import {SQLite} from 'ionic-native';
import {SQLiteObject} from '@ionic-native/sqlite';
import {Autostart} from '@ionic-native/autostart';
import {EmojiPickerModule} from '@ionic-tools/emoji-picker';
import {Geolocation} from '@ionic-native/geolocation';

//import {Push, PushObject, PushOptions} from '@ionic-native/push';
import {StatusBar} from '@ionic-native/status-bar';
//import { SplashScreen } from '@ionic-native/splash-screen';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject,
} from '@ionic-native/file-transfer';
import {SocialSharing} from '@ionic-native/social-sharing';
import {AppMinimize} from '@ionic-native/app-minimize';
import {Crop} from '@ionic-native/crop';
import {Diagnostic} from '@ionic-native/diagnostic';
import {NgxAutoScrollModule} from 'ngx-auto-scroll';
import {VirtualScrollModule} from 'angular2-virtual-scroll';
// providers
import {PhoneNumberRegisterProvider} from '../providers/phone-number-register/phone-number-register';
import {ApiProvider} from '../providers/api/api';
import {AlertProvider} from '../providers/alert/alert';
import {ContactsProvider} from '../providers/contacts/contacts';
import {ChatsProvider} from '../providers/chats/chats';
import {GroupProvider} from '../providers/group/group';
import {LocalDatabaseProvider} from '../providers/local-database/local-database';
import {NetworkProvider} from '../providers/network/network';

// components
import {ScrollableTabs} from '../components/scrollable-tabs/scrollable-tabs';
import {ProfileProvider} from '../providers/profile/profile';
import {FCM} from '@ionic-native/fcm';
//import { HelloWorld} from '../pipes/myPipe';

export const firebaseConfig = {
  apiKey: 'AIzaSyDRP8_CRNgIoSm4-nk1ZhFk-O5Q_nRDen4',
  authDomain: 'getgroupy-67b07.firebaseapp.com',
  databaseURL: 'https://getgroupy-67b07.firebaseio.com',
  projectId: 'getgroupy-67b07',
  storageBucket: 'getgroupy-67b07.appspot.com',
  messagingSenderId: '1052136905267',
};

@NgModule({
  declarations: [
    MyApp,
    ScrollableTabs,
    // HelloWorld,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    MomentModule,
    VirtualScrollModule,
    NgxAutoScrollModule,
    EmojiPickerModule.forRoot(),
    IonicModule.forRoot(MyApp, {
      // Tabs config
      tabsHideOnSubPages: true,
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp],
  providers: [
    Diagnostic,
    SQLite,
    StatusBar,
    NativeStorage,
    SocialSharing,
    Geolocation,
    // SplashScreen,
    Autostart,
    PhoneNumberRegisterProvider,

    Contacts,
    Camera,
    File,
    FilePath,
    AppMinimize,
    Crop,
    FileTransfer,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler,
    },
    ApiProvider,
    AlertProvider,
    ContactsProvider,
    ChatsProvider,
    GroupProvider,
    LocalDatabaseProvider,
    NetworkProvider,
    ProfileProvider,
    //  Push,
    FCM,
  ],
})
export class AppModule {
  @ViewChild(Nav) nav: Nav;
  constructor(
    //  public push: Push,
    public localDb: LocalDatabaseProvider,
    public app: App,
    private fcm: FCM
  ) {
    this.pushsetup();
  }
  pushsetup() {
    this.fcm.subscribeToTopic('all');
    this.fcm.getToken().then(token => {
      console.log(token, 'token.....');
      this.localDb.device_token = token;
    });
    this.fcm.onNotification().subscribe(notification => {
      console.log(notification, 'notification payload');
      if (notification.wasTapped) {
        console.log('Received in background');
        console.log(JSON.parse(notification.data));
        let payload = JSON.parse(notification.data);

        if (payload.data_chat_type == 0) {
          console.log('one 2 one caht..');
          let obj = {
            cid: payload.id,
            is_online: payload.is_online,
            lastMessage: payload.id,
            last_seen: payload.last_seen,
            message_time: payload.message_time,
            mobileNo: payload.id,
            name: payload.sender_name,
            photos: payload.photos,
            seen_count: 0,
            sender_id: payload.sender,
            sent: true,
            thread_id: payload.thread_id,
            userId: payload.sender,
          };
          var nav = this.app.getActiveNav();
          console.log(nav, 'nav');
          console.log(obj, 'obj');
          nav.push('ChatViewPage', {contact: obj});
        } else {
          let obj = {
            cid: payload.id,
            date_added: payload.date_added,
            group_image: payload.group_image,
            group_name: payload.group_name,
            group_name_he: payload.group_name_he,
            id: payload.receiver,
            is_admin: payload.is_admin,
            is_visible: payload.is_visible,
            member_count: payload.members_count,
            message: payload.message,
            message_time: payload.message_time,
            seen_count: payload.seen_count,
            sender_id: payload.sender,
            status: payload.status,
            thread_id: payload.thread_id,
            username: payload.username,
            username_he: payload.username_he,
          };
          console.log(obj, 'group chat');
          var nav = this.app.getActiveNav();
          console.log(nav, 'nav');
          console.log(obj, 'obj');
          nav.push('GroupChatViewPage', {
            contact: obj,
            status: payload.statuss,
            path: undefined,
            my_groupIds: payload.my_groupIds,
          });
         
        }
      } else {
        console.log('Received in foreground');
      }
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      console.log(token, 'token refresh');
    });
    // initialize push notifications
    //   const options: PushOptions = {
    //     android: {
    //       senderID: '757800332740',
    //       sound: true,
    //       vibrate: true,
    //       forceShow:true,
    //       clearNotifications: true,
    //     },
    //     ios: {
    //       alert: 'true',
    //       badge: true,
    //       sound: 'true',
    //     },
    //     windows: {},
    //     browser: {
    //       pushServiceURL: 'http://push.api.phonegap.com/v1/push',
    //     },
    //   };
    //   const pushObject: PushObject = this.push.init(options);
    //   pushObject.on('notification').subscribe((notification: any) => {
    //     console.log('Received a notification', notification);
    //     if (!notification.additionalData.foreground) {
    //       alert(1221432);
    //     } else {
    //       let obj = {
    //         cid: notification.additionalData.id,
    //         is_online: notification.additionalData.is_online,
    //         lastMessage: notification.additionalData.id,
    //         last_seen: notification.additionalData.last_seen,
    //         message_time: notification.additionalData.message_time,
    //         mobileNo: notification.additionalData.id,
    //         name: notification.additionalData.sender_name,
    //         photos: notification.additionalData.photos,
    //         seen_count: 0,
    //         sender_id: notification.additionalData.sender,
    //         sent: true,
    //         thread_id: notification.additionalData.thread_id,
    //         userId: notification.additionalData.sender,
    //       };
    //       var nav = this.app.getActiveNav();
    //       console.log(nav,"nav")
    //       console.log(obj, 'obj');
    //       nav.push('ChatViewPage', {contact: obj});
    //     }
    //   });
    //   pushObject.on('registration').subscribe((registration: any) => {
    //     console.log('Device registered', registration);
    //     this.localDb.device_token = registration.registrationId;
    //     console.log('Device token is ', this.localDb.device_token);
    //   });
    //   pushObject
    //     .on('error')
    //     .subscribe(error => console.error('Error with Push plugin', error));
  }
}
