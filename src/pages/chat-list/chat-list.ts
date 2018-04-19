import {Component} from '@angular/core';
import {
  NavController,
  MenuController,
  IonicPage,
  PopoverController,
  Events,
} from 'ionic-angular';
import * as io from 'socket.io-client';
// import { RegistrationPage } from '../registration/registration'; import {
// ChatViewPage } from '../chat-view/chat-view';

import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {ChatsProvider} from '../../providers/chats/chats';
import {ContactsProvider} from '../../providers/contacts/contacts';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';
import {NetworkProvider} from '../../providers/network/network';
import {ApiProvider} from '../../providers/api/api';
import {GroupProvider} from '../../providers/group/group';

declare var require: any;
declare var angular: any;

@IonicPage()
@Component({selector: 'page-chat-list', templateUrl: 'chat-list.html'})
export class ChatListPage {
  chatList: any = [];
  contacts: any = [];
  noChats: boolean;
  socket: any;
  imageUrl: any;

  searchQuerry: string;
  searchGroupArray: any = [];
  searchQuery = '';
  block_status = [];
  is_search: boolean = false;
  constructor(
    public navCtrl: NavController,
    public event: Events,
    public groupProvider: GroupProvider,
    public popoverCtrl: PopoverController,
    public menuController: MenuController,
    public phoneNumberRegisterProvider: PhoneNumberRegisterProvider,
    public chatsProvider: ChatsProvider,
    public contactsProvider: ContactsProvider,
    public localDb: LocalDatabaseProvider,
    public networkProvider: NetworkProvider,
    public apiProvider: ApiProvider
  ) {
    this.menuController.enable(true, 'nav');
    this.localDb.getContacts();
    // this   .localDb   .popover   .dismiss();
    this.imageUrl = this.apiProvider.imageUrl;
  }

  ionViewWillEnter() {
    // alert(1); this.localDb.length = 0; this.localDb.messagesShow = [];
    this.localDb.thread_id = '';

    if (this.networkProvider.isOffline()) {
      this.localDb.getChatList().then(
        data => {
          this.localDb.db.executeSql('SELECT * FROM NotSent', []).then(
            data => {
              if (data.rows.length > 0) {
                let notSent = data.rows;
                for (var i = 0; i < notSent.length; i++) {
                  for (var x in this.localDb.chatList) {
                    if (
                      this.localDb.chatList[x].thread_id == notSent.item(i).room
                    ) {
                      this.localDb.chatList[x].lastMessage = notSent.item(
                        i
                      ).message;
                      this.localDb.chatList[x].sent = false;
                    } else {
                      this.localDb.chatList[x].sent = true;
                    }
                  }
                }
              }
            },
            error => {
              console.log('ERROR: ' + JSON.stringify(error));
              //  this.localDb.noChats = true;
            }
          );
        },
        err => {
          this.localDb.noChats = true;
        }
      );
    } else {
      this.phoneNumberRegisterProvider.arr = [];
      this.phoneNumberRegisterProvider.getChatCounterArray().then(
        data => {
          console.log('getChatCounterArray', data);
          var newArr = [];
          angular.forEach(data, function(value, key) {
            var exists = false;
            angular.forEach(newArr, function(val2, key) {
              if (angular.equals(value.thread_id, val2.thread_id)) {
                exists = true;
              }
            });
            if (exists == false && value.thread != '') {
              newArr.push(value);
            }
          });

          console.log('newArr', newArr);
          this.phoneNumberRegisterProvider
            .checkMessageCounter(newArr)
            .subscribe(data => {
              console.log('checkMessageCounter chat list', data);
              let res = data.data;
              this.phoneNumberRegisterProvider.chatCountRes = res;
              for (let x in res) {
                console.log(
                  'this.phoneNumberRegisterProvider.chatCounter ..',
                  this.phoneNumberRegisterProvider.chatCounter
                );
                console.log(res[x]);
                if (res[x].counter != 0) {
                  if (this.phoneNumberRegisterProvider.arr.length != 0) {
                    // arr already has value
                    for (let y in this.phoneNumberRegisterProvider.arr) {
                      if (
                        this.phoneNumberRegisterProvider.arr[y].thread_id ==
                        res[x].thread_id
                      ) {
                      } else {
                        this.phoneNumberRegisterProvider.arr.push(res[x]);
                      }
                    }
                  } else {
                    // frst time entry
                    this.phoneNumberRegisterProvider.arr.push(res[x]);
                  }
                }
              }

              this.event.publish(
                'chatbadge:updated',
                this.phoneNumberRegisterProvider.arr.length
              );

              this.getChatLists();
              this.getPublicGroups();
              this.getPrivateGroups();
            });
        },
        err => {
          console.log('error in getChatCounterArray', err);
          this.getChatLists();
          this.getPublicGroups();
          this.getPrivateGroups();
        }
      );
    }
  }

  /** get public groups*/
  getPublicGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 0,
    };
    this.groupProvider.getUserGroups(requestParams).subscribe(
      data => {
        if (data.data.length != 0) {
          for (let d in data.data) {
            this.phoneNumberRegisterProvider.groupIds.push(data.data[d].id);
          }
        }
      },
      err => {
        console.log('getPublicGroups', err);
      }
    );
  }

  /** get private groups */
  getPrivateGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 1,
    };
    this.groupProvider.getUserGroups(requestParams).subscribe(
      data => {
        if (data.data.length != 0) {
          for (let d in data.data) {
            this.phoneNumberRegisterProvider.groupIds.push(data.data[d].id);
          }
        }
      },
      err => {
        console.log('getPrivateGroups', err);
      }
    );
  }

  // get all users whom we have chated yet
  getChatLists() {
    this.phoneNumberRegisterProvider.chatArrayCounter = [];
    //    this.socket = io('http://192.168.88.14:3322');
    this.localDb.db.executeSql('SELECT * FROM Contacts', []).then(
      data => {
        this.contacts = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            this.contacts.push({
              name: data.rows.item(i).name,
              mobile_no: data.rows.item(i).mobileNo,
              userId: data.rows.item(i).userId,
              photo: data.rows.item(i).photo,
            });
          }
          this.chatsProvider
            .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
            .subscribe(
              data => {
                console.log('chat list dats', data);
                this.localDb.chatList = [];
                this.block_status = [];
                if (data.data.length != 0) {
                  for (let m in data.data) {
                    this.block_status.push({
                      blocked_user_id: data.data[m].blocked_user_id,
                      blocking_user_id: data.data[m].blocking_user_id,
                    });

                    let obj = {
                      thread_id: data.data[m].thread_id,
                      sender: this.phoneNumberRegisterProvider.user_id,
                      receiver: data.data[m].userID,
                    };
                    if (this.localDb.subsribeThread_ids.length != 0) {
                      if (
                        this.localDb.subsribeThread_ids.filter(
                          threadId => threadId == data.data[m].thread_id
                        ).length == 0
                      ) {
                        this.apiProvider.socket.emit('subscribe', obj);
                        this.localDb.subsribeThread_ids.push(
                          data.data[m].thread_id
                        );
                      } else {
                      }
                    } else {
                      this.apiProvider.socket.emit('subscribe', obj);
                      this.localDb.subsribeThread_ids.push(
                        data.data[m].thread_id
                      );
                    }

                    // this.apiProvider.socket.emit('subscribe', data.data[m].thread_id);
                    var crypto = require('crypto');
                    var decipher = crypto.createDecipher(
                      'aes-256-ctr',
                      'd6F3Efeq'
                    );
                    var dec = decipher.update(
                      data.data[m].message,
                      'hex',
                      'utf8'
                    );

                    let isContactAvailable = false;
                    for (let c in this.contacts) {
                      if (
                        this.contacts[c].mobile_no == data.data[m].mobile_no
                      ) {
                        this.localDb.chatList.push({
                          lastMessage: dec,
                          thread_id: data.data[m].thread_id,
                          userId: data.data[m].userID,
                          name: this.contacts[c].name,
                          mobileNo: data.data[m].mobile_no,
                          photos: data.data[m].profile_picture,
                          sent: true,
                          is_online: data.data[m].is_online,
                          last_seen: data.data[m].last_seen,
                          message_time: data.data[m].message_time,
                          seen_count: data.data[m].seen_count,
                          sender_id: data.data[m].sender_id,
                          cid: data.data[m].cid,
                        });
                        for (let z in this.localDb.chatList) {
                          this.phoneNumberRegisterProvider.chatArrayCounter.push(
                            {
                              thread_id: this.localDb.chatList[z].thread_id,
                              chat_id: this.localDb.chatList[z].cid,
                            }
                          );
                        }
                        this.searchGroupArray = this.localDb.chatList;
                        console.log(
                          'chat counter array.',
                          this.phoneNumberRegisterProvider.chatArrayCounter
                        );
                        this.phoneNumberRegisterProvider.setChatCounterArray(
                          this.phoneNumberRegisterProvider.chatArrayCounter
                        );
                        isContactAvailable = true;
                        break;
                      }
                    }
                    if (!isContactAvailable)
                      this.localDb.chatList.push({
                        lastMessage: dec,
                        thread_id: data.data[m].thread_id,
                        userId: data.data[m].userID,
                        name: data.data[m].username,
                        mobileNo: data.data[m].mobile_no,
                        photos: data.data[m].profile_picture,
                        sent: true,
                        is_online: data.data[m].is_online,
                        last_seen: data.data[m].last_seen,
                        message_time: data.data[m].message_time,
                        seen_count: data.data[m].seen_count,
                        sender_id: data.data[m].sender_id,
                        cid: data.data[m].cid,
                      });
                    for (let z in this.localDb.chatList) {
                      this.phoneNumberRegisterProvider.chatArrayCounter.push({
                        thread_id: this.localDb.chatList[z].thread_id,
                        chat_id: this.localDb.chatList[z].cid,
                      });
                    }
                    console.log(
                      'chat counter array.',
                      this.phoneNumberRegisterProvider.chatArrayCounter
                    );
                    this.phoneNumberRegisterProvider.setChatCounterArray(
                      this.phoneNumberRegisterProvider.chatArrayCounter
                    );
                    this.localDb.noChats = false;
                  }
                  this.localDb.saveChatList(this.localDb.chatList);
                } else {
                  this.localDb.noChats = true;
                }
              },
              err => {
                console.log(err);
                this.localDb.getChatList().then(
                  data => {
                    this.localDb.db
                      .executeSql('SELECT * FROM NotSent', [])
                      .then(
                        data => {
                          if (data.rows.length > 0) {
                            let notSent = data.rows;
                            for (var i = 0; i < notSent.length; i++) {
                              for (var x in this.localDb.chatList) {
                                if (
                                  this.localDb.chatList[x].thread_id ==
                                  notSent.item(i).room
                                ) {
                                  this.localDb.chatList[
                                    x
                                  ].lastMessage = notSent.item(i).message;
                                  this.localDb.chatList[x].sent = false;
                                } else {
                                  this.localDb.chatList[x].sent = true;
                                }
                              }
                            }
                          }
                        },
                        error => {
                          console.log('ERROR: ' + JSON.stringify(error));
                        }
                      );
                  },
                  err => {}
                );
              }
            );
        } else {
          this.chatsProvider
            .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
            .subscribe(
              data => {
                this.localDb.chatList = [];
                if (data.data.length != 0) {
                  for (let m in data.data) {
                    var crypto = require('crypto');
                    var decipher = crypto.createDecipher(
                      'aes-256-ctr',
                      'd6F3Efeq'
                    );
                    var dec = decipher.update(
                      data.data[m].message,
                      'hex',
                      'utf8'
                    );
                    this.localDb.chatList.push({
                      lastMessage: dec,
                      thread_id: data.data[m].thread_id,
                      userId: data.data[m].userID,
                      name: data.data[m].username,
                      mobileNo: data.data[m].mobile_no,
                      photos: data.data[m].profile_picture,
                      sent: true,
                      message_time: data.data[m].message_time,
                      seen_count: data.data[m].seen_count,
                      sender_id: data.data[m].sender_id,
                      cid: data.data[m].cid,
                    });
                    for (let z in this.localDb.chatList) {
                      this.phoneNumberRegisterProvider.chatArrayCounter.push({
                        thread_id: this.localDb.chatList[z].thread_id,
                        chat_id: this.localDb.chatList[z].cid,
                      });
                    }
                    console.log(
                      'chat counter array.',
                      this.phoneNumberRegisterProvider.chatArrayCounter
                    );
                    this.phoneNumberRegisterProvider.setChatCounterArray(
                      this.phoneNumberRegisterProvider.chatArrayCounter
                    );
                    this.localDb.noChats = false;
                  }
                  this.localDb.saveChatList(this.localDb.chatList);
                } else {
                  this.localDb.noChats = true;
                }
              },
              err => {
                console.log(err);
                this.localDb.getChatList().then(
                  data => {
                    this.localDb.db
                      .executeSql('SELECT * FROM NotSent', [])
                      .then(
                        data => {
                          if (data.rows.length > 0) {
                            let notSent = data.rows;
                            for (var i = 0; i < notSent.length; i++) {
                              for (var x in this.localDb.chatList) {
                                if (
                                  this.localDb.chatList[x].thread_id ==
                                  notSent.item(i).room
                                ) {
                                  this.localDb.chatList[
                                    x
                                  ].lastMessage = notSent.item(i).message;
                                  this.localDb.chatList[x].sent = false;
                                } else {
                                  this.localDb.chatList[x].sent = true;
                                }
                              }
                            }
                          }
                        },
                        error => {
                          console.log('ERROR: ' + JSON.stringify(error));
                        }
                      );
                  },
                  err => {}
                );
              }
            );
        }
      },
      error => {
        console.log('ERROR: ' + JSON.stringify(error));
      }
    );
    console.log(this.localDb.chatList, 'this.localDb.chatLis/////......t');
  }

  register() {
    this.navCtrl.push('RegistrationPage');
  }

  goToChat(contact, index) {
    console.log('block status', this.block_status, contact);
    this.phoneNumberRegisterProvider.setUserBlockStatus(
      this.block_status[index]
    );
    this.navCtrl.push('ChatViewPage', {contact: contact});
  }

  getAllData() {
    this.localDb.getTest();
  }

  /** popover show */
  presentPopover(ev: UIEvent, member) {
    this.localDb.popover = this.popoverCtrl.create('ChatListPopoverPage', {});
    this.localDb.popover.present({ev: event});
  }

  call_search() {
    this.is_search = true;
  }
  searchGroups(ev) {
    let val = ev.target.value;
    this.searchQuerry = ev.target.value;
    if (val && val.trim() != '') {
      this.localDb.chatList = this.searchGroupArray.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  }
  onClear(ev) {
    this.searchQuery = '';
    this.localDb.chatList = this.searchGroupArray;
  }
  onKeyEvent(ev) {
    if (this.searchQuerry.length == 1) {
      this.localDb.chatList = this.searchGroupArray;
    }
  }
  onCancel() {
    this.is_search = false;
  }
}
