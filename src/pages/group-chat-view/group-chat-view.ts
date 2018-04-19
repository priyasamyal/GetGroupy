import {
  Component,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  Content,
  TextInput,
  Events,
  PopoverController,
} from 'ionic-angular';
import {EmojiPickerModule} from '@ionic-tools/emoji-picker';
import {NativeStorage} from '@ionic-native/native-storage';
import {MomentModule} from 'angular2-moment';
import {AlertProvider} from '../../providers/alert/alert';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {ApiProvider} from '../../providers/api/api';
import {NetworkProvider} from '../../providers/network/network';
import {GroupProvider} from '../../providers/group/group';
import {ChatsProvider} from '../../providers/chats/chats';

@IonicPage()
@Component({
  selector: 'page-group-chat-view',
  templateUrl: 'group-chat-view.html',
})
export class GroupChatViewPage {
  @ViewChild(Content) content: Content;
  @ViewChild('textInput') textInput: TextInput;
  @Output() childReadyEvent: EventEmitter<string> = new EventEmitter();
  noContacts: boolean;
  chatList: any = [];
  contacts: any = [];
  userId: any;
  block_status = [];
  messages: any = [];
  messagesShow: any = [];
  chat_input: string = '';
  chats = [];
  demlo: string = 'hkfjhweoriyoi';
  reciver_id: any;
  group_name: any;
  group_image: any;
  member_count: any;
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

  is_joined: boolean = true;
  total_pages;
  current_page = 1;
  order = 'id';

  is_visible: any;
  oneTimeScroll: boolean = true;

  constructor(
    public navCtrl: NavController,
    private nativeStorage: NativeStorage,
    public popoverCtrl: PopoverController,
    public navParams: NavParams,
    public networkProvider: NetworkProvider,
    public events: Events,
    public apiProvider: ApiProvider,
    public element: ElementRef,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider,
    public localDb: LocalDatabaseProvider,
    public alertProvider: AlertProvider,
    public groupProvider: GroupProvider,
    public chatsProvider: ChatsProvider
  ) {
    console.log('contacts found', this.localDb.contacts);

    this.localDb.isRecieved = false;
    this.localDb.thread_id = '';
    this.localDb.messagesShow = [];

    let cont = this.navParams.get('contact');
    console.log('cont ' + JSON.stringify(cont));

    this.reciver_id = cont.id; // group ki id
    this.group_name = cont.group_name;
    this.is_online = cont.is_online;
    this.last_seen = cont.last_seen;
    this.member_count = cont.member_count;
    if (cont.group_image == undefined || cont.group_image == '') {
      this.group_image = 'assets/group-icon.png';
    } else {
      if (cont.group_image == 'no_image.jpeg') {
        this.group_image = 'assets/group-icon.png';
      } else {
        this.group_image = this.apiProvider.imageUrl + '/' + cont.group_image;
      }
    }

    if (cont.status == '0') {
      this.is_joined = false;
    }
    this.is_visible = cont.is_visible;

    if (cont.thread_id) this.localDb.thread_id = cont.thread_id;
    console.log('thread id group chat view .........', this.localDb.thread_id);

    if (this.localDb.thread_id != undefined && this.localDb.thread_id != '') {
      console.log('enter');
      let obj = {
        thread_id: this.localDb.thread_id,
        sender: this.phoneNumberRegisterProvider.user_id,
        receiver: this.reciver_id,
        page_num: this.current_page,
        is_group: 1,
      };
      console.log(obj);
      this.apiProvider.socket.emit('subscribe', obj);
    } else {
      console.log(' else enter');

      let obj = {
        thread_id: 'new',
        sender: this.phoneNumberRegisterProvider.user_id,
        receiver: this.reciver_id,
        page_num: this.current_page,
      };
      console.log(obj);
      this.apiProvider.socket.emit('subscribe', obj);
      this.localDb.firstTime = true;
    }

    this.apiProvider.socket.on('typing', data => {
      console.log('typing...', data);
      var env = this;
      console.log(env.phoneNumberRegisterProvider.user_id);
      env.user_id = env.phoneNumberRegisterProvider.user_id;
      if (data.message != '') {
        env.typer_id = data.sender_id;
        console.log(env.phoneNumberRegisterProvider.user_id.typer_id);
        if (env.typer_id != env.user_id && data.room == env.localDb.thread_id) {
          env.isOnline = false;
        }
      } else {
        env.isOnline = true;
      }
    });
  }

  /** auto scroll view */
  autoScroll() {
    console.log('call autoscroll');
    setTimeout(function() {
      var itemList = document.getElementById('chat-autoscroll');
      itemList.scrollTop = itemList.scrollHeight;
    }, 10);
  }

  ScrollToBottom() {
    var element = document.getElementById('myLabel');
    setTimeout(() => {
      element.scrollIntoView(true);
    }, 200);
    var element = document.getElementById('myLabel');

    this.oneTimeScroll = false;
  }
  demo() {
    this.content.scrollToBottom(0);
  }
  ionViewWillEnter() {
    console.log('ionViewDidLoad ChatViewPage');
    this.nativeStorage.remove('groupCounter');
    this.phoneNumberRegisterProvider.groupArrayCounter = [];

    this.lessChatBadge();
    this.getChatLists();
    if (this.networkProvider.isOffline()) {
      this.localDb.getSingleUserChats(this.localDb.thread_id).then(
        data => {
          console.log('getSingleUserChats', data);
          this.localDb.finalChat = this.localDb.messagesShow;
          this.localDb.length = this.localDb.finalChat.length;
        },
        err => {
          console.log('getSingleUserChats', err);
        }
      );
    }
  }

  /** decrement chgroupat badge */
  lessChatBadge() {
    for (var a in this.phoneNumberRegisterProvider.groupCountRes) {
      if (
        this.localDb.thread_id ==
        this.phoneNumberRegisterProvider.groupCountRes[a].thread_id
      ) {
        this.phoneNumberRegisterProvider.groupCountRes[a].counter = 0;
      }
    }

    for (var b in this.phoneNumberRegisterProvider.arr2) {
      console.log('index of count', b);
      if (
        this.localDb.thread_id ==
        this.phoneNumberRegisterProvider.arr2[b].thread_id
      ) {
        this.phoneNumberRegisterProvider.arr2.splice(b, 1);
      }
    }
    this.events.publish(
      'groupbadge:updated',
      this.phoneNumberRegisterProvider.arr2.length
    );
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
  show_join_alert(msg) {
    this.alertProvider
      .join_confirm('Join group to send message', 'Cancel', 'Join')
      .then(
        data => {
          console.log(data, 'data on dismiss');
          let a = this.navParams.get('contact');
          console.log(a, 'paramse to send');

          let requestParams = {
            group_id: a.id,
            user_id: this.phoneNumberRegisterProvider.user_id,
            status: 1,
          };
          this.groupProvider.ConfirmBlockGroup(requestParams).subscribe(
            data => {
              this.is_joined = true;
              this.send(msg);
            },
            err => {
              console.log(err);
              this.alertProvider.showAlert('Server not responding');
            }
          );
        },
        err => {
          console.log(err, 'error');
        }
      );
  }
  /** send message */
  send(msg) {
    console.log('is_visible send..........', this.is_visible);
    if (!this.is_joined) {
      this.show_join_alert(msg);
    } else {
      console.log(this.phoneNumberRegisterProvider.user_name);
      if (this.networkProvider.isOffline()) {
        let messagePush;
        messagePush = {
          message: msg,
          sender: this.phoneNumberRegisterProvider.user_id,
          receiver: this.reciver_id,
          time: new Date(),
          is_visible: this.is_visible,
          user_is_visible: this.is_visible,
          profile_picture: this.phoneNumberRegisterProvider.profile_picture,
          nickname: this.phoneNumberRegisterProvider.nickname,
          data_chat_type: 1,
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
            members_count: this.member_count,
            time: x.time,
            sent: false,
            sender_name: this.phoneNumberRegisterProvider.user_name,
            profile_picture: this.phoneNumberRegisterProvider.profile_picture,
            is_visible: this.is_visible,
            nickname: this.phoneNumberRegisterProvider.nickname,
            data_chat_type: 1,
            user_is_visible: this.is_visible,
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
              members_count: this.member_count,
              sender_name: this.phoneNumberRegisterProvider.user_name,
              data_chat_type: 1,
              is_visible: this.is_visible,
              profile_picture: this.phoneNumberRegisterProvider.profile_picture,
              nickname: this.phoneNumberRegisterProvider.nickname,
              user_is_visible: this.is_visible,
              date_added: this.navParams.get('contact').date_added,
              group_image: this.navParams.get('contact').group_image,
              group_name: this.navParams.get('contact').group_name,
              group_name_he: this.navParams.get('contact').group_name_he,
              is_admin: this.navParams.get('contact').is_admin,
              message_time: this.navParams.get('contact').message_time,
              seen_count: this.navParams.get('contact').seen_count,
              status: this.navParams.get('contact').status,
              username: this.navParams.get('contact').username,
              username_he: this.navParams.get('contact').username_he,
              statuss: this.navParams.get('status'),
              my_groupIds: this.navParams.get('my_groupIds'),
            });
            console.log('send successfully!');
          } else {
            this.apiProvider.socket.emit('send', {
              room: 'new',
              message: msg,
              sender: this.phoneNumberRegisterProvider.user_id,
              receiver: this.reciver_id,
              members_count: this.member_count,
              sender_name: this.phoneNumberRegisterProvider.user_name,
              profile_picture: this.phoneNumberRegisterProvider.profile_picture,
              is_visible: this.is_visible,
              nickname: this.phoneNumberRegisterProvider.nickname,
              data_chat_type: 1,
              user_is_visible: this.is_visible,
              date_added: this.navParams.get('contact').date_added,
              group_image: this.navParams.get('contact').group_image,
              group_name: this.navParams.get('contact').group_name,
              group_name_he: this.navParams.get('contact').group_name_he,
              is_admin: this.navParams.get('contact').is_admin,
              message_time: this.navParams.get('contact').message_time,
              seen_count: this.navParams.get('contact').seen_count,
              status: this.navParams.get('contact').status,
              username: this.navParams.get('contact').username,
              username_he: this.navParams.get('contact').username_he,
              statuss: this.navParams.get('status'),
              my_groupIds: this.navParams.get('my_groupIds'),
            });
          }
        }
      }

      this.content.scrollToBottom();
      this.chat_input = '';
    }
  }

  handleSelection(event) {
    this.chat_input = this.chat_input + ' ' + event.char;
    console.log(this.chat_input);
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

  /** navigate to group detail */
  groupDetail(group) {
    this.navCtrl.push('GroupDetailPage', {
      group: this.navParams.get('contact'),
      path: this.navParams.get('path'),
      my_groupIds: this.navParams.get('my_groupIds'),
    });
  }

  fileChange(event) {
    this.navCtrl.push('CaptionImagePage', {
      event: event,
      title_image: this.group_image,
    });
  }

  doRefresh(refresher, status) {
    console.log('do refresh');
    if (status == 'read') {
      console.log('start paginition');
      this.current_page = this.current_page + 1;
      console.log('current page is', this.current_page);
      if (this.current_page <= this.localDb.total_page) {
        if (
          this.localDb.thread_id != undefined &&
          this.localDb.thread_id != ''
        ) {
          console.log('enter');
          let obj = {
            thread_id: this.localDb.thread_id,
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.reciver_id,
            page_num: this.current_page,
          };
          console.log(obj);
          this.apiProvider.socket.emit('subscribe', obj);
        } else {
          console.log(' else enter');

          let obj = {
            thread_id: 'new',
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.reciver_id,
            page_num: this.current_page,
          };
          console.log(obj);
          this.apiProvider.socket.emit('subscribe', obj);
          this.localDb.firstTime = true;
        }
      }
    } else {
      setTimeout(() => {
        console.log('Async operation has ended');
        refresher.complete();
      }, 1000);
    }
  }

  /** popover oprn */
  presentPopover(ev: UIEvent) {
    console.log(event);
    this.localDb.popover = this.popoverCtrl.create('InvisiblePopoverPage', {
      data: this.is_visible,
      group_id: this.navParams.get('contact').id,
    });
    this.localDb.popover.present({ev: event});
    this.localDb.popover.onDidDismiss(data => {
      console.log('onDidDismiss', data);
      if (data.msg == 'Success') {
        if (this.is_visible == '1') {
          this.is_visible = '0';
        } else {
          this.is_visible = '1';
        }
      }
    });
  }

  getPhoto(url, is_visible) {
    if (url != null) {
      if (is_visible == 1) {
        return this.apiProvider.imageUrl + url;
      } else {
        return 'assets/no-user.png';
      }
    } else {
      return 'assets/no-user.png';
    }
  }
  // get all users whom we have chated yet
  getChatLists() {
    this.chatsProvider
      .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
      .subscribe(
        data => {
          console.log(data);
          this.block_status = [];
          if (data.data.length != 0) {
            for (let m in data.data) {
              this.block_status.push({
                blocked_user_id: data.data[m].blocked_user_id,
                blocking_user_id: data.data[m].blocking_user_id,
              });
              this.chatList.push({
                lastMessage: data.data[m].message,
                thread_id: data.data[m].thread_id,
                contact_id: data.data[m].userID,
                displayName: data.data[m].username,
                phoneNumbers: data.data[m].mobile_no,
                photos: null,
                sent: true,
                is_online: data.data[m].is_online,
                last_seen: data.data[m].last_seen,
                blocked_user_id: data.data[m].blocked_user_id,
                blocking_user_id: data.data[m].blocking_user_id,
              });
            }
            console.log(this.block_status, 'Array block status');
          }
          // this   .localDb   .saveChatList(data.data); console.log(this.chatList);
        },
        err => {
          console.log(err);
        }
      );
  }

  // go to chat view
  goToChat(contact, index) {
    var sendCont;
    sendCont = {};
    if (this.chatList.length != 0) {
      for (let x in this.chatList) {
        if (this.chatList[x].contact_id == contact.sender_id) {
          console.log(':match ...');
          console.log('chat list...', this.chatList[x]);
          console.log('contact list..', contact);
          sendCont.thread_id = this.chatList[x].thread_id;
          sendCont.is_online = this.chatList[x].is_online;
          sendCont.last_seen = this.chatList[x].last_seen;
          sendCont.id = this.chatList[x].contact_id;
          sendCont.photos = contact.profile_picture;
          sendCont.name = contact.sender_name;
        }
      }
      console.log(sendCont);
      this.navCtrl.push('ChatViewPage', {contact: sendCont}).then(() => {
        const index = this.navCtrl.getActive().index;
        this.navCtrl.remove(index - 1);
      });
    } else {
      // no chat  yet with anyone
      console.log(contact);
      sendCont.id = contact.sender_id;
      sendCont.photos = contact.profile_picture;
      sendCont.name = contact.sender_name;
      this.navCtrl.push('ChatViewPage', {contact: sendCont}).then(() => {
        const index = this.navCtrl.getActive().index;
        this.navCtrl.remove(index - 1);
      });
    }
  }
}
