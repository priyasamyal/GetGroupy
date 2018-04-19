import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {SQLite} from 'ionic-native';
import {SQLiteObject} from '@ionic-native/sqlite';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';

import {ApiProvider} from '../api/api';
import {PhoneNumberRegisterProvider} from '../phone-number-register/phone-number-register';

declare var require : any;
declare var cordova : any;

@Injectable()
export class LocalDatabaseProvider {
  finalChat = [];
  show : boolean = false;
  db : any;
  contacts : any = [];
  constactsLeft : any = [];
  chatList : any;
  noChats : boolean;
  noContacts : boolean;
  noPublicGroups : boolean;
  noPrivateGroups : boolean;
  noWorldGroups : boolean;
  noaroundMeGroups : boolean;
  thread_id : any;
  messagesShow : any = [];
  isRecieved : boolean;
  firstTime : boolean = true;
  worldGroups : any = [];
  publicGroups : any = [];
  privateGroups : any = [];
  aroundMeGroups : any = [];
  groupDetail : any = [];
  subsribeThread_ids : any = [];
  current_lat : number;
  current_lng : number;
  device_token : any;
  current_location : string;
  popover : any;
  member_count : any;
  total_page : any;
  length : number;
  canRemoveMember : boolean = false;
  modal : any;
  constructor(public http : Http, private transfer : FileTransfer, public file : File, public filePath : FilePath, public apiProvider : ApiProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider) {
    console.log('Hello LocalDatabaseProvider Provider');

  }

  // save contacts in local DB
  saveContactsInDb(contacts) {

    this
      .db
      .executeSql('CREATE TABLE IF NOT EXISTS Contacts (userId PRIMARY KEY ,name,mobileNo,photo)', {})
      .then(() => {
        console.log('Created contacts table');
        console.log("contacts get", contacts);
        for (let c in contacts) {

          this
            .db
            .executeSql("UPDATE Contacts SET name = ?, mobileNo = ?, photo = ? WHERE userId = ?", [contacts[c].displayName, contacts[c].phoneNumbers, contacts[c].photos, contacts[c].contact_id])
            .then((data) => {
              if (data.rowsAffected == 0) 
                this.db.executeSql("INSERT INTO Contacts (userId,name,mobileNo,photo) VALUES (?,?,?,?)", [contacts[c].contact_id, contacts[c].displayName, contacts[c].phoneNumbers, contacts[c].photos]).then((data) => {
                  console.log("INSERTED: " + JSON.stringify(data));
                }, (error) => {
                  console.log("ERROR: " + JSON.stringify(error.err));
                });
              }
            , (error) => {
              console.log("ERROR: " + JSON.stringify(error.err));
            });
        }
      })
      .catch(e => {
        console.log(e)
      });
  }

  /** save chat lists in local database */
  saveChatList(chatList) {

    this
      .db
      .executeSql('CREATE TABLE IF NOT EXISTS ChatList (thread_id  PRIMARY KEY, name,mobileNo,photo' +
          ',lastMessage,userId,sent,message_time,seen_count,sender_id', {})
      .then(() => {
        console.log('Created ChatList table');
        console.log("ChatList get", chatList);
        for (let chat in chatList) {
          this
            .db
            .executeSql("UPDATE ChatList SET name = ?, mobileNo = ?, photo = ? , lastMessage = ?,sent=?, " +
                "message_time=?,seen_count=?userId=?,sender_id=? WHERE thread_id = ?",
            [
              chatList[chat].name,
              chatList[chat].mobileNo,
              chatList[chat].photos,
              chatList[chat].lastMessage,
              true,
              chatList[chat].message_time,
              chatList[chat].seen_count,
              chatList[chat].userId,
              chatList[chat].sender_id,

              chatList[chat].thread_id
            ])
            .then((data) => {
              console.log(data, "update sucess")
              if (data.rowsAffected == 0) 
                this.db.executeSql("INSERT INTO ChatList (userId, name, mobileNo, photo, lastMessage, thread_id,send" +
                    "er_id,sent,message_time,seen_count) VALUES (?,?,?,?,?,?,?,?,?,?)",
                [
                  chatList[chat].userId,
                  chatList[chat].name,
                  chatList[chat].mobileNo,
                  chatList[chat].photos,
                  chatList[chat].lastMessage,
                  chatList[chat].thread_id,
                  chatList[chat].sender_id,
                  true,
                  chatList[chat].message_time,
                  chatList[chat].seen_count
                ]).then((data) => {
                  console.log("INSERTED: " + JSON.stringify(data));
                }, (error) => {
                  console.log("ERROR: " + JSON.stringify(error.err));
                });
              }
            , (error) => {
              console.log("ERROR: " + JSON.stringify(error.err));
            });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  /** save chat of particular user */

  saveChatByUserId(chat) {
    console.log("saveChatByUserId  ", chat)
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql('CREATE TABLE IF NOT EXISTS UserChats (id PRIMARY KEY NOT NULL, photo, message,th' +
            'read_id, sender_name,sender_id,reciever_id, time,sent,members_count,receiver_cou' +
            'nt,seen_count,is_visible,profile_picture,nickname,user_is_visible )', {})
        .then(() => {
          this
            .db
            .executeSql("UPDATE UserChats SET   photo = ? ,is_visible=?, message = ?, thread_id=?, sender" +
                "_id=?, reciever_id=?, time=?, sent=?,members_count=?,receiver_count=?,seen_count" +
                "=?, sender_name=? ,nickname=?,profile_picture=?,user_is_visible=? WHERE id = ?",
            [
              null,
              chat.is_visible,
              chat.msg,
              chat.thread_id,
              chat.sender_id,
              chat.reciever_id,
              chat.time,
              chat.sent,
              chat.members_count,
              chat.receiver_count,
              chat.seen_count,
              chat.sender_name,
              chat.nickname,
              chat.profile_picture,
              chat.user_is_visible,
              chat.id
            ])
            .then((data) => {
              if (data.rowsAffected == 0) {
                this
                  .db
                  .executeSql("INSERT INTO UserChats (id,  photo, message, thread_id, sender_id, reciever_id,ti" +
                      "me,sent,members_count,receiver_count,seen_count, sender_name,is_visible,nickname" +
                      ",profile_picture,user_is_visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                  [
                    chat.id,
                    null,
                    chat.msg,
                    chat.thread_id,
                    chat.sender_id,
                    chat.reciever_id,
                    chat.time,
                    chat.sent,
                    chat.members_count,
                    chat.receiver_count,
                    chat.seen_count,
                    chat.sender_name,
                    chat.is_visible,
                    chat.nickname,
                    chat.profile_picture,
                    chat.user_is_visible
                  ])
                  .then((data) => {
                    console.log("INSERT", chat.id);
                    var d = {
                      msg: chat,
                      inserted: true
                    };
                    resolve(d);
                    console.log("end call saveChatByUserId   ");
                  }, (error) => {
                    reject(error);
                  })
              } else {
                console.log("UPDATE", chat.id);
                var d = {
                  msg: chat,
                  inserted: false
                };
                resolve(d);
              }

            }, (error) => {
              reject(error);
            });

        })
        .catch(e => {
          reject(e);
        });
    });
  }

  /** get user chat  */

  getSingleUserChats(thred_id) {
    console.log("treadId", thred_id)
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql("SELECT * FROM UserChats where thread_id =? Order by id ASC", [thred_id])
        .then((data) => {
          // console.log("get chats view...............", JSON.stringify(data));
          this.messagesShow = [];
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              this
                .messagesShow
                .push({
                  msg: data
                    .rows
                    .item(i)
                    .message,
                  sender_id: data
                    .rows
                    .item(i)
                    .sender_id,
                  reciever_id: data
                    .rows
                    .item(i)
                    .reciever_id,
                  thread_id: data
                    .rows
                    .item(i)
                    .thread_id,
                  id: data
                    .rows
                    .item(i)
                    .id,
                  time: data
                    .rows
                    .item(i)
                    .time,
                  sent: true,
                  members_count: data
                    .rows
                    .item(i)
                    .members_count,
                  receiver_count: data
                    .rows
                    .item(i)
                    .receiver_count,
                  seen_count: data
                    .rows
                    .item(i)
                    .seen_count,
                  sender_name: data
                    .rows
                    .item(i)
                    .sender_name,
                  nickname: data
                    .rows
                    .item(i)
                    .nickname
                })
            }
            this
              .db
              .executeSql("SELECT * FROM NotSent where room =? Order by Id ASC", [thred_id])
              .then((data) => {
                if (data.rows.length > 0) {
                  for (var i = 0; i < data.rows.length; i++) {
                    this
                      .messagesShow
                      .push({
                        msg: data
                          .rows
                          .item(i)
                          .message,
                        sender_id: data
                          .rows
                          .item(i)
                          .sender,
                        reciever_id: data
                          .rows
                          .item(i)
                          .reciever,
                        thread_id: data
                          .rows
                          .item(i)
                          .room,
                        id: data
                          .rows
                          .item(i)
                          .Id,
                        time: data
                          .rows
                          .item(i)
                          .time,
                        sent: false,
                        sender_name: data
                          .rows
                          .item(i)
                          .sender_name
                      })
                  }
                }
              }, (error) => {
                console.log("ERROR: " + JSON.stringify(error));
              });

          } else {}
          resolve(this.messagesShow);
        }, (error) => {
          console.log("ERROR: " + JSON.stringify(error));
          reject(error);
        });
    })
  }

  /** get contacts lists */
  getTest() {

    this
      .db
      .executeSql("SELECT * FROM NotSent", [])
      .then((data) => {
        console.log(data)
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            console.log("room:", data.rows.item(i).room, "message:", data.rows.item(i).message, "sender:", data.rows.item(i).sender, "receiver:", data.rows.item(i).receiver, "members_count:", data.rows.item(i).members_count)
          }
        } else {}
      }, (error) => {});
  }

  /** get contacts lists */
  getContacts() {
    this
      .db
      .executeSql("SELECT * FROM Contacts", [])
      .then((data) => {
        this.contacts = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            if (data.rows.item(i).userId != this.phoneNumberRegisterProvider.user_id) {
              this
                .contacts
                .push({
                  name: data
                    .rows
                    .item(i)
                    .name,
                  mobile_no: data
                    .rows
                    .item(i)
                    .mobileNo,
                  userId: data
                    .rows
                    .item(i)
                    .userId,
                  photo: data
                    .rows
                    .item(i)
                    .photo,
                  isCheck: false
                });
            }

          }

        } else {}

        if (this.contacts.length != 0) {
          this.noContacts = false;
        } else {
          this.noContacts = true;
        }
      }, (error) => {});
  }

  /** get chat lists */
  getChatList() {
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql("SELECT * FROM Chatlist", [])
        .then((data) => {

          this.chatList = [];
          if (data.rows.length > 0) {
            this.noChats = false;
            for (var i = 0; i < data.rows.length; i++) {
              this
                .chatList
                .push({
                  lastMessage: data
                    .rows
                    .item(i)
                    .lastMessage,
                  name: data
                    .rows
                    .item(i)
                    .name,
                  mobileNo: data
                    .rows
                    .item(i)
                    .mobileNo,
                  userId: data
                    .rows
                    .item(i)
                    .userId,
                  photo: data
                    .rows
                    .item(i)
                    .photo,
                  thread_id: data
                    .rows
                    .item(i)
                    .thread_id,
                  sent: true
                });
            }
            console.log(this.chatList, "offine fetch chatlist")
          } else {
            this.noChats = true;
          }
          resolve(this.chatList)
        }, (error) => {
          reject(false);
        });
    })
  }

  /** save send messages */
  saveNotSendMsg(msg) {
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql('CREATE TABLE IF NOT EXISTS NotSent (Id INTEGER PRIMARY KEY AUTOINCREMENT,sender,' +
            ' message,receiver,room,time,sender_name)', {})
        .then(() => {
          console.log('Created NotSent table');
          // debugger;
          console.log("saveNotSendMsg", msg);

          this
            .db
            .executeSql("INSERT INTO NotSent (sender, message, receiver, room,time, sender_name) VALUES (" +
                "?,?,?,?,?,?)",
            [
              msg.sender,
              msg.message,
              msg.receiver,
              msg.room,
              msg.time,
              msg.sender_name
            ])
            .then((data) => {
              console.log("INSERTED: NotSent table" + JSON.stringify(data));
              msg.id = data.insertId;
              resolve(msg);
            }, (error) => {
              console.log("ERROR: " + JSON.stringify(error.err));
              reject(error)
            });
        }, (error) => {
          console.log("ERROR: created table " + JSON.stringify(error.err));
        })
    })
  }

  /** send all not sent messages */
  sendSavedMsg() {
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql("SELECT * FROM NotSent", [])
        .then((data) => {
          console.log("NotSent", data);
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              console.log("enter for not send table send to server ")
              if (data.rows.item(i).room != undefined) {

                //  this.apiProvider.socket.emit('subscribe', data.rows.item(i).room);
                let obj = {
                  thread_id: data
                    .rows
                    .item(i)
                    .room,
                  sender: this.phoneNumberRegisterProvider.user_id,
                  receiver: data
                    .rows
                    .item(i)
                    .receiver
                }
                console.log(obj)
                this
                  .apiProvider
                  .socket
                  .emit('subscribe', obj);
                this
                  .apiProvider
                  .socket
                  .emit('send', {
                    room: data
                      .rows
                      .item(i)
                      .room,
                    message: data
                      .rows
                      .item(i)
                      .message,
                    sender: data
                      .rows
                      .item(i)
                      .sender,
                    receiver: data
                      .rows
                      .item(i)
                      .receiver,
                    members_count: 2,
                    sender_name: data
                      .rows
                      .item(i)
                      .sender_name
                  });

              } else {
                console.log("enter else not send table send to server ")
                this
                  .apiProvider
                  .socket
                  .emit('subscribe', 'new');
                this
                  .apiProvider
                  .socket
                  .emit('send', {
                    room: "new",
                    message: data
                      .rows
                      .item(i)
                      .message,
                    sender: data
                      .rows
                      .item(i)
                      .sender,
                    receiver: data
                      .rows
                      .item(i)
                      .reciever,
                    members_count: 2,
                    sender_name: data
                      .rows
                      .item(i)
                      .sender_name
                  });
              }

              this
                .db
                .executeSql("DELETE FROM NotSent WHERE Id =?", [
                  data
                    .rows
                    .item(i)
                    .Id
                ]);

              if (this.thread_id == data.rows.item(i).room) {
                console.log("this.thread_id == data.rows.item(i).room sent mesg.........")
                console.log(this.messagesShow)
                for (var j = this.messagesShow.length - 1; j >= 0; --j) {
                  if (this.messagesShow[j].id == data.rows.item(i).Id) {
                    this
                      .messagesShow
                      .splice(j, 1);
                  }
                }
                console.log(this.messagesShow)
              }

            }
          } else {}
          resolve(true);
        }, (error) => {
          reject(false);
          console.log("not send table send to server err", error)
        });
    })
  }

  /** save world groups */
  saveWorldGroups(groups) {
    return new Promise((resolve, reject) => {
      console.log("saveWorldGroups", groups);
      resolve(true)
      this
        .db
        .executeSql('CREATE TABLE IF NOT EXISTS WorldGroups (Id PRIMARY KEY ,group_name,offline_group' +
            '_image,online_group_image,date_added,type,member_count,thread_id)', {})
        .then(() => {
          console.log('Created contacts table');
          //debugger; console.log("groups get", groups);
          for (let g of groups) {
            console.log(g, "g")
            if (g.group_image != "no_image.jpeg") {
              this
                .downloadImage(g.group_image, g.id)
                .then(data => {
                  var downloaded_image = data;
                  console.log(downloaded_image);
                  this
                    .db
                    .executeSql("UPDATE WorldGroups SET group_name = ?, offline_group_image = ?,online_group_imag" +
                        "e=?,date_added = ?,type=?,member_count=?,thread_id=? WHERE Id = ?",
                    [
                      g.group_name,
                      downloaded_image,
                      g.group_image,
                      g.date_added,
                      g.type,
                      g.member_count,
                      g.thread_id,
                      g.id
                    ])
                    .then((data) => {
                      if (data.rowsAffected == 0) 
                        this.db.executeSql("INSERT INTO WorldGroups (Id,group_name,offline_group_image,online_group_image,da" +
                            "te_added,type,member_count,thread_id) VALUES (?,?,?,?,?,?,?,?)",
                        [
                          g.id,
                          g.group_name,
                          downloaded_image,
                          g.group_image,
                          g.date_added,
                          g.type,
                          g.member_count,
                          g.thread_id
                        ]).then((data) => {
                          console.log("INSERTED WorldGroups: " + JSON.stringify(data));
                        }, (error) => {
                          console.log("ERROR WorldGroups 1: " + JSON.stringify(error.err));
                        });
                      }
                    , (error) => {
                      console.log("ERROR WorldGroups 2: " + JSON.stringify(error.err));
                    });
                });

            } else {
              this
                .db
                .executeSql("UPDATE WorldGroups SET group_name = ?, offline_group_image = ?,online_group_imag" +
                    "e=?,date_added = ?,type=?,member_count=?,thread_id=? WHERE Id = ?",
                [
                  g.group_name,
                  "assets/group-icon.png",
                  g.group_image,
                  g.date_added,
                  g.type,
                  g.member_count,
                  g.thread_id,
                  g.id
                ])
                .then((data) => {
                  if (data.rowsAffected == 0) 
                    this.db.executeSql("INSERT INTO WorldGroups (Id,group_name,offline_group_image,online_group_image,da" +
                        "te_added,type,member_count,thread_id) VALUES (?,?,?,?,?,?,?,?)",
                    [
                      g.id,
                      g.group_name,
                      "assets/group-icon.png",
                      g.group_image,
                      g.date_added,
                      g.type,
                      g.member_count,
                      g.thread_id
                    ]).then((data) => {
                      console.log("INSERTED WorldGroups: " + JSON.stringify(data));
                    }, (error) => {
                      console.log("ERROR WorldGroups 1: " + JSON.stringify(error.err));
                    });
                  }
                , (error) => {
                  console.log("ERROR WorldGroups 2: " + JSON.stringify(error.err));
                });
            }
          }
        })
        .catch(e => {
          console.log(e)
        });
    })
  }

  /** save public groups */
  savePublicGroups(groups) {
    return new Promise((resolve, reject) => {
      // console.log("savePublicGroups", groups);
      resolve(true)
      this
        .db
        .executeSql('CREATE TABLE IF NOT EXISTS PublicGroups (Id  PRIMARY KEY ,group_name,offline_gro' +
            'up_image,online_group_image,date_added,type,member_count,thread_id)', {})
        .then(() => {
          console.log('Created contacts table');
          //debugger; console.log("groups get", groups);
          for (let g of groups) {
            if (g.group_image != "no_image.jpeg") {
              this
                .downloadImage(g.group_image, g.id)
                .then(data => {
                  var downloaded_image = data;
                  console.log(downloaded_image);
                  this
                    .db
                    .executeSql("UPDATE PublicGroups SET group_name = ?, offline_group_image = ?,online_group_ima" +
                        "ge=?,date_added = ?,type=?,member_count=?,thread_id=? WHERE Id = ?",
                    [
                      g.group_name,
                      downloaded_image,
                      g.group_image,
                      g.date_added,
                      g.type,
                      g.member_count,
                      g.thread_id,
                      g.id
                    ])
                    .then((data) => {
                      if (data.rowsAffected == 0) 
                        this.db.executeSql("INSERT INTO PublicGroups (Id,group_name,offline_group_image,online_group_image,d" +
                            "ate_added,type,member_count,thread_id) VALUES (?,?,?,?,?,?,?,?)",
                        [
                          g.id,
                          g.group_name,
                          downloaded_image,
                          g.group_image,
                          g.date_added,
                          g.type,
                          g.member_count,
                          g.thread_id
                        ]).then((data) => {
                          console.log("INSERTED PublicGroups: " + JSON.stringify(data));
                        }, (error) => {
                          console.log("ERROR PublicGroups 1: " + JSON.stringify(error.err));
                        });
                      }
                    , (error) => {
                      console.log("ERROR PublicGroups 2: " + JSON.stringify(error.err));
                    });
                });

            } else {
              this
                .db
                .executeSql("UPDATE PublicGroups SET group_name = ?, offline_group_image = ?,online_group_ima" +
                    "ge=?,date_added = ?,type=?,member_count=? ,thread_id=? WHERE Id = ?",
                [
                  g.group_name,
                  "assets/group-icon.png",
                  g.group_image,
                  g.date_added,
                  g.type,
                  g.member_count,
                  g.thread_id,
                  g.id
                ])
                .then((data) => {
                  if (data.rowsAffected == 0) 
                    this.db.executeSql("INSERT INTO PublicGroups (Id,group_name,offline_group_image,online_group_image,d" +
                        "ate_added,type,member_count,thread_id) VALUES (?,?,?,?,?,?,?,?)",
                    [
                      g.id,
                      g.group_name,
                      "assets/group-icon.png",
                      g.group_image,
                      g.date_added,
                      g.type,
                      g.member_count,
                      g.thread_id
                    ]).then((data) => {
                      console.log("INSERTED PublicGroups: " + JSON.stringify(data));
                    }, (error) => {
                      console.log("ERROR PublicGroups 1: " + JSON.stringify(error.err));
                    });
                  }
                , (error) => {
                  console.log("ERROR PublicGroups 2: " + JSON.stringify(error.err));
                });
            }
          }
        })
        .catch(e => {
          console.log(e)
        });
    })
  }

  /** save private groups */
  savePrivateGroups(groups) {

    return new Promise((resolve, reject) => {
      // console.log("savePrivateGroups", groups);
      resolve(true)
      this
        .db
        .executeSql('CREATE TABLE IF NOT EXISTS PrivateGroups (Id  PRIMARY KEY ,group_name,offline_gr' +
            'oup_image,online_group_image,date_added,type,member_count,thread_id)', {})
        .then(() => {
          //console.log('Created contacts table'); debugger;
          console.log("groups get", groups);
          for (let g of groups) {
            if (g.group_image != "no_image.jpeg") {
              this
                .downloadImage(g.group_image, g.id)
                .then(data => {
                  var downloaded_image = data;
                  console.log(downloaded_image);
                  this
                    .db
                    .executeSql("UPDATE PrivateGroups SET group_name = ?, offline_group_image = ?,online_group_im" +
                        "age=?,date_added = ?,type=?,member_count=?,thread_id=? WHERE Id = ?",
                    [
                      g.group_name,
                      downloaded_image,
                      g.group_image,
                      g.date_added,
                      g.type,
                      g.member_count,
                      g.thread_id,
                      g.id
                    ])
                    .then((data) => {
                      if (data.rowsAffected == 0) 
                        this.db.executeSql("INSERT INTO PrivateGroups (Id,group_name,offline_group_image,online_group_image," +
                            "date_added,type,member_count,thread_id) VALUES (?,?,?,?,?,?,?,?)",
                        [
                          g.id,
                          g.group_name,
                          downloaded_image,
                          g.group_image,
                          g.date_added,
                          g.type,
                          g.member_count,
                          g.thread_id
                        ]).then((data) => {
                          console.log("INSERTED PrivateGroups: " + JSON.stringify(data));
                        }, (error) => {
                          console.log("ERROR PrivateGroups 1: " + JSON.stringify(error.err));
                        });
                      }
                    , (error) => {
                      console.log("ERROR PrivateGroups 2: " + JSON.stringify(error.err));
                    });
                });

            } else {
              this
                .db
                .executeSql("UPDATE PrivateGroups SET group_name = ?, offline_group_image = ?,online_group_im" +
                    "age=?,date_added = ?,type=?,member_count=?,thread_id=? WHERE Id = ?",
                [
                  g.group_name,
                  "assets/group-icon.png",
                  g.group_image,
                  g.date_added,
                  g.type,
                  g.member_count,
                  g.thread_id,
                  g.id
                ])
                .then((data) => {
                  if (data.rowsAffected == 0) 
                    this.db.executeSql("INSERT INTO PrivateGroups (Id,group_name,offline_group_image,online_group_image," +
                        "date_added,type,member_count,thread_id) VALUES (?,?,?,?,?,?,?,?)",
                    [
                      g.id,
                      g.group_name,
                      "assets/group-icon.png",
                      g.group_image,
                      g.date_added,
                      g.type,
                      g.member_count,
                      g.thread_id
                    ]).then((data) => {
                      console.log("INSERTED PrivateGroups: " + JSON.stringify(data));
                    }, (error) => {
                      console.log("ERROR PrivateGroups 1: " + JSON.stringify(error.err));
                    });
                  }
                , (error) => {
                  console.log("ERROR PrivateGroups 2: " + JSON.stringify(error.err));
                });
            }
          }
        })
        .catch(e => {
          console.log(e)
        });
    })
  }

  /** save group detail */
  saveGroupsDeatil(group, group_id) {
    return new Promise((resolve, reject) => {
      // console.log("saveGroupsDeatil", group);
      resolve(true)
      this
        .db
        .executeSql('CREATE TABLE IF NOT EXISTS GroupDetails (Id  PRIMARY KEY ,username,is_admin)', {})
        .then(() => {
          // console.log('Created contacts table'); debugger; console.log("groups get",
          // group);
          for (let g of group) {

            this
              .db
              .executeSql("UPDATE GroupDetails SET username=?,is_admin=? WHERE Id = ?", [g.username, g.is_admin, group_id])
              .then((data) => {
                if (data.rowsAffected == 0) 
                  this.db.executeSql("INSERT INTO GroupDetails (Id,username,is_admin) VALUES (?,?,?)", [g.username, g.is_admin, group_id]).then((data) => {
                    console.log("INSERTED GroupDetails: " + JSON.stringify(data));
                  }, (error) => {
                    console.log("ERROR GroupDetails 1: " + JSON.stringify(error.err));
                  });
                }
              , (error) => {
                console.log("ERROR GroupDetails 2: " + JSON.stringify(error.err));
              })
              .catch(e => {
                console.log(e)
              });
          }
        })
    })
  }
  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    console.log("copyFileToLocalDir");
    this
      .file
      .copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
      .then(success => {
        return (cordova.file.dataDirectory + newFileName);
      }, error => {
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

  /** get world groups */
  getGroupDetailById(group_id) {
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql("SELECT * FROM GroupDetails where id = ?", [group_id])
        .then((data) => {
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              this
                .groupDetail
                .push({
                  username: data
                    .rows
                    .item(i)
                    .username,
                  is_admin: data
                    .rows
                    .item(i)
                    .is_admin
                })
            }
          }
          resolve(this.groupDetail);
        }, (error) => {
          reject(false);

        });
    })
  }

  /** get all world groups */
  getWorldGroups() {
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql("SELECT * FROM WorldGroups", [])
        .then((data) => {

          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              this
                .worldGroups
                .push({
                  id: data
                    .rows
                    .item(i)
                    .Id,
                  group_name: data
                    .rows
                    .item(i)
                    .group_name,
                  offline_group_image: data
                    .rows
                    .item(i)
                    .offline_group_image,
                  member_count: data
                    .rows
                    .item(i)
                    .member_count,
                  date_added: data
                    .rows
                    .item(i)
                    .date_added,
                  type: data
                    .rows
                    .item(i)
                    .type,
                  thread_id: data
                    .rows
                    .item(i)
                    .thread_id
                })
            }
          }
          resolve(this.worldGroups);
        }, (error) => {
          reject(false);
        });
    })
  }

  /** get all public groups */
  getPublicGroups() {
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql("SELECT * FROM PublicGroups", [])
        .then((data) => {
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              this
                .publicGroups
                .push({
                  group_name: data
                    .rows
                    .item(i)
                    .group_name,
                  offline_group_image: data
                    .rows
                    .item(i)
                    .offline_group_image,
                  member_count: data
                    .rows
                    .item(i)
                    .member_count,
                  date_added: data
                    .rows
                    .item(i)
                    .date_added,
                  type: data
                    .rows
                    .item(i)
                    .type,
                  thread_id: data
                    .rows
                    .item(i)
                    .thread_id,
                  id: data
                    .rows
                    .item(i)
                    .Id
                })
            }
          }
          resolve(this.publicGroups);
        }, (error) => {
          reject(false);
        });
    })
  }

  /** get all private groups */
  getPrivateGroups() {
    return new Promise((resolve, reject) => {
      this
        .db
        .executeSql("SELECT * FROM PrivateGroups", [])
        .then((data) => {
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              this
                .privateGroups
                .push({
                  group_name: data
                    .rows
                    .item(i)
                    .group_name,
                  offline_group_image: data
                    .rows
                    .item(i)
                    .offline_group_image,
                  member_count: data
                    .rows
                    .item(i)
                    .member_count,
                  date_added: data
                    .rows
                    .item(i)
                    .date_added,
                  type: data
                    .rows
                    .item(i)
                    .type,
                  thread_id: data
                    .rows
                    .item(i)
                    .thread_id,
                  id: data
                    .rows
                    .item(i)
                    .Id
                })
            }
          }
          resolve(this.privateGroups);
        }, (error) => {
          reject(false);
        });
    })
  }

  /** download image from server */
  downloadImage(image, id) {
    // var group = this.getWorldGroups(id); console.log(group);
    // console.log("downloadImage", image)
    return new Promise((resolve, reject) => {
      const fileTransfer : FileTransferObject = this
        .transfer
        .create();
      const url = this.apiProvider.imageUrl + "/" + image;
      // console.log("url", url);
      fileTransfer
        .download(url, this.file.dataDirectory + image)
        .then((entry) => {
          console.log('download complete: ' + entry.toURL());
          resolve(entry.toURL());
        }, (error) => {
          // handle error
          console.log('download error', error)
        });
    })

  }

}
