import {
  Component,
  ElementRef,
  Injectable,
  ViewChild,
  OnInit,
  AfterViewChecked,
} from '@angular/core';
import {
  NavController,
  NavParams,
  Content,
  PopoverController,
  IonicPage,
  Platform,
  TextInput,
  ActionSheetController,
  Events,
} from 'ionic-angular';
import {NativeStorage} from '@ionic-native/native-storage';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {EmojiPickerModule} from '@ionic-tools/emoji-picker';
import * as io from 'socket.io-client';
import * as SocketIOFileClient from 'socket.io-file-client/socket.io-file-client.js';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';

import {ChatListPage} from '../chat-list/chat-list';
import {MomentModule} from 'angular2-moment';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {NetworkProvider} from '../../providers/network/network';
import {ApiProvider} from '../../providers/api/api';
import {AlertProvider} from '../../providers/alert/alert';
import {ProfileProvider} from '../../providers/profile/profile';

declare var require: any;

declare var cordova: any;

@IonicPage()
@Injectable()
@Component({
  selector: 'page-chat-view',
  templateUrl: 'chat-view.html',
  providers: [ChatListPage],
})
export class ChatViewPage {
  @ViewChild(Content) content: Content;
  @ViewChild('textInput') textInput: TextInput;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  messages: any = [];
  messagesShow: any = [];
  chat_input: string = '';
  chats = [];
  reciver_id: any;
  reciever_name: any;
  timeout: any;
  user_id: any;
  typer_id: any;
  isOnline: boolean = true;
  toggled: boolean = false;
  emojitext: string;
  is_online: any;
  last_seen: any;
  showEmopad: boolean = true;
  showKeypad: boolean;
  delivery: any;
  height: any;
  bottom: any;
  url: any;
  oneTimeScroll: boolean = true;

  is_blocked;
  current_page = 1;

  constructor(
    public navCtrl: NavController,
    private nativeStorage: NativeStorage,
    public element: ElementRef,
    private sanitizer: DomSanitizer,
    public navParams: NavParams,
    public events: Events,
    private camera: Camera,
    public popoverCtrl: PopoverController,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    public file: File,
    public filePath: FilePath,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider,
    public chatListPage: ChatListPage,
    public localDb: LocalDatabaseProvider,
    public networkProvider: NetworkProvider,
    public apiProvider: ApiProvider,
    public alertProvider: AlertProvider,
    public profileProvider: ProfileProvider
  ) {
    console.log('total Pages');
    this.localDb.isRecieved = false;
    this.localDb.thread_id = '';
    this.localDb.messagesShow = [];
    let cont = this.navParams.get('contact');
    console.log('cont ' + JSON.stringify(cont));
    if (cont.photos != null) {
      this.url = this.apiProvider.imageUrl + cont.photos;
    } else {
      this.url = 'assets/no-user.png';
    }
    if (cont.id != undefined) {
      this.reciver_id = cont.id;
    }
    if (cont.userId != undefined) {
      this.reciver_id = cont.userId;
    }

    this.reciever_name = cont.name;
    this.is_online = cont.is_online;
    this.last_seen = cont.last_seen;

    if ((cont.thread_id, 'cont.thread_id'))
      if (cont.thread_id) this.localDb.thread_id = cont.thread_id;

    if (this.localDb.thread_id != undefined && this.localDb.thread_id != '') {
      let obj = {
        thread_id: this.localDb.thread_id,
        sender: this.phoneNumberRegisterProvider.user_id,
        receiver: this.reciver_id,
        page_num: this.current_page,
      };

      this.apiProvider.socket.emit('subscribe', obj);
    } else {
      this.phoneNumberRegisterProvider.setUserBlockStatus({
        blocked_user_id: null,
        blocking_user_id: null,
      });
      let obj = {
        thread_id: 'new',
        sender: this.phoneNumberRegisterProvider.user_id,
        receiver: this.reciver_id,
        page_num: this.current_page,
      };

      this.apiProvider.socket.emit('subscribe', obj);
      this.localDb.firstTime = true;
    }

    this.apiProvider.socket.on('typing', data => {
      var env = this;

      env.user_id = env.phoneNumberRegisterProvider.user_id;
      if (data.message != '') {
        env.typer_id = data.sender_id;

        if (env.typer_id != env.user_id && data.room == env.localDb.thread_id) {
          env.isOnline = false;
        }
      } else {
        env.isOnline = true;
      }
    });

    /** scroll to bottom event */
    // this   .events   .subscribe('message:pushed', () => {
    // console.log("chatcome...");     //   this.ScrollToBottom();   });
    console.log('finalChat', this.localDb.finalChat);
  }

  ScrollToBottom() {
    var element = document.getElementById('myLabel');
    setTimeout(() => {
      element.scrollIntoView(true);
    }, 200);
    this.oneTimeScroll = false;
  }

  autoScroll() {
    setTimeout(function() {
      var itemList = document.getElementById('chat-autoscroll');
      itemList.scrollTop = itemList.scrollHeight;
      console.log('hel;;');
    });
  }

  demo() {
    this.content.scrollToBottom(0);
  }
  // ngOnInit() {   this.scrol lToBottom(); } ngAfterViewChecked() {
  // this.scrollToBottom(); } scrollToBottom() : void {   try {
  // this.myScrollContainer.nativeElement.scrollBottom =
  // this.myScrollContainer.nativeElement.scrollHeight;     console.log("try",
  // this.myScrollContainer.nativeElement.scrollHeight);   } catch (err) {
  // console.log(err, "catch")   } }

  ionViewWillEnter() {
    this.nativeStorage.remove('chatCounter');
    this.phoneNumberRegisterProvider.chatArrayCounter = [];

    this.lessChatBadge();
    this.phoneNumberRegisterProvider.getChatCounterArray().then(data => {
      console.log('chat view ', data);
    });

    this.is_blocked = this.phoneNumberRegisterProvider.getUserBlockStatus();

    if (this.networkProvider.isOffline()) {
      this.localDb.getSingleUserChats(this.localDb.thread_id).then(
        data => {
          this.localDb.finalChat = this.localDb.messagesShow;
          this.localDb.length = this.localDb.finalChat.length;
        },
        err => {
          console.log('getSingleUserChats', err);
        }
      );
    }
  }

  ionViewDidLeave() {
    console.log('this.localDb.length', this.localDb.length);
    console.log('this.localDb.finalChat.length', this.localDb.finalChat.length);
  }
  /** decrement chat badge */
  lessChatBadge() {
    for (var a in this.phoneNumberRegisterProvider.chatCountRes) {
      if (
        this.localDb.thread_id ==
        this.phoneNumberRegisterProvider.chatCountRes[a].thread_id
      ) {
        this.phoneNumberRegisterProvider.chatCountRes[a].counter = 0;
      }
    }

    for (var b in this.phoneNumberRegisterProvider.arr) {
      console.log('index of count', b);
      if (
        this.localDb.thread_id ==
        this.phoneNumberRegisterProvider.arr[b].thread_id
      ) {
        // this.phoneNumberRegisterProvider.chatCountRes[a].counter = 0;

        this.phoneNumberRegisterProvider.arr.splice(b, 1);
      }
    }
    this.events.publish(
      'chatbadge:updated',
      this.phoneNumberRegisterProvider.arr.length
    );
  }

  /** start typing */
  onKeyEvent(event: any) {
    if (this.chat_input.length != 0) {
      let typingObject = {
        room: this.localDb.thread_id,
        message: 'typing...',
        sender_id: this.phoneNumberRegisterProvider.user_id,
      };
      this.apiProvider.socket.emit('typing', typingObject);
    } else {
      let typingObject = {
        room: this.localDb.thread_id,
        message: '',
        sender_id: this.phoneNumberRegisterProvider.user_id,
      };
      this.apiProvider.socket.emit('typing', typingObject);
      this.isOnline = true;
    }
  }

  /** stop typing */
  focusoutEvent(): void {
    let typingObject = {
      room: this.localDb.thread_id,
      message: '',
      sender_id: this.phoneNumberRegisterProvider.user_id,
    };
    this.apiProvider.socket.emit('typing', typingObject);
    //  clearTimeout(this.timeout);
  }

  focusinEvent() {
    this.showEmopad = true;
    this.showKeypad = false;
  }

  /** Unblock Contact */
  unblock_contact(msg) {
    let requestParam = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      blocked_user_id: this.reciver_id,
    };

    this.profileProvider.unblock_contact(requestParam).subscribe(
      data => {
        this.phoneNumberRegisterProvider.setUserBlockStatus({
          blocked_user_id: null,
          blocking_user_id: null,
        });
        this.send_message(msg);
      },
      err => {
        console.log(err);
      }
    );
  }

  send_message(msg) {
    if (this.networkProvider.isOffline()) {
      let messagePush;
      messagePush = {
        message: msg,
        sender: this.phoneNumberRegisterProvider.user_id,
        receiver: this.reciver_id,
        time: new Date(),
      };
      if (this.localDb.thread_id != '')
        messagePush['room'] = this.localDb.thread_id;
      else messagePush['room'] = 'new';

      this.localDb.saveNotSendMsg(messagePush).then(data => {
        let res = JSON.stringify(data);
        let x = JSON.parse(res);
        this.localDb.messagesShow.push({
          msg: x.message,
          sender_id: x.sender,
          reciever_id: x.receiver,
          thread_id: x.room,
          id: x.id,
          members_count: 2,
          time: x.time,
          sent: false,
          sender_name: this.phoneNumberRegisterProvider.user_name,
        });
      });
    } else {
      if (msg != '') {
        if (this.localDb.thread_id != '') {
          this.apiProvider.socket.emit('send', {
            room: this.localDb.thread_id,
            message: msg,
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.reciver_id,
            members_count: 2,
            sender_name: this.phoneNumberRegisterProvider.user_name,
            data_chat_type: 0,
            is_online: this.navParams.get('contact').is_online,
            last_seen: this.navParams.get('contact').last_seen,
            photos: this.navParams.get('contact').photos,
          });
        } else {
          this.apiProvider.socket.emit('send', {
            room: 'new',
            message: msg,
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.reciver_id,
            members_count: 2,
            sender_name: this.phoneNumberRegisterProvider.user_name,
            data_chat_type: 0,
            is_online: this.navParams.get('contact').is_online,
            last_seen: this.navParams.get('contact').last_seen,
            photos: this.navParams.get('contact').photos,
          });
        }
      }
      this.autoScroll();
    }

    this.content.scrollToBottom();
    this.chat_input = '';
  }

  /** send message */
  send(msg) {
    if (this.is_blocked != undefined) {
      if (
        this.is_blocked.blocking_user_id != null &&
        this.is_blocked.blocking_user_id ==
          this.phoneNumberRegisterProvider.user_id
      ) {
        this.alertProvider
          .confirm_unblock('Unblock ' + this.reciever_name + ' to send Message')
          .then(
            data => {
              this.unblock_contact(msg);
            },
            err => {
              console.log(err, 'error');
            }
          );
      } else if (
        this.is_blocked.blocking_user_id != null &&
        this.is_blocked.blocking_user_id == this.reciver_id
      ) {
        this.alertProvider.showAlert(
          "You can't send message to " +
            this.reciever_name +
            ' as user blocked you.'
        );
      } else {
        this.send_message(msg);
      }
    } else {
      this.send_message(msg);
    }
  }

  handleSelection(event) {
    this.chat_input = this.chat_input + ' ' + event.char;
  }

  /** popover oprn */
  presentPopover(ev: UIEvent) {
    this.localDb.popover = this.popoverCtrl.create('ChatViewPopoverPage');
    this.localDb.popover.present({ev: event});
  }

  toggleKeypad() {
    //  debugger;
    if (this.showEmopad) {
      this.showKeypad = true;
      this.showEmopad = false;
    } else {
      this.showEmopad = true;
      this.showKeypad = false;
      this.textInput.setFocus();
    }
  }

  fileChange(event) {
    this.navCtrl.push('CaptionImagePage', {
      event: event,
      title_image: 'assets/no-user.png',
    });
  }

  /** navigate to friend detail */
  friendDetail() {
    this.navCtrl.push('FriendDetailPage', {user_id: this.reciver_id});
  }

  doRefresh(refresher, status) {
    this.current_page = this.current_page + 1;

    if (this.localDb.thread_id != undefined && this.localDb.thread_id != '') {
      let obj = {
        thread_id: this.localDb.thread_id,
        sender: this.phoneNumberRegisterProvider.user_id,
        receiver: this.reciver_id,
        page_num: this.current_page,
      };

      this.apiProvider.socket.emit('subscribe', obj);
    } else {
      this.phoneNumberRegisterProvider.setUserBlockStatus({
        blocked_user_id: null,
        blocking_user_id: null,
      });
      let obj = {
        thread_id: 'new',
        sender: this.phoneNumberRegisterProvider.user_id,
        receiver: this.reciver_id,
        page_num: this.current_page,
      };

      this.apiProvider.socket.emit('subscribe', obj);
      this.localDb.firstTime = true;
    }

    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }

  back() {
    this.navCtrl.setRoot('ChatListPage', {tabIndex: 0}).then(() => {
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(index - 1);
      this.navCtrl.remove(index - 2);
    });
  }
}
