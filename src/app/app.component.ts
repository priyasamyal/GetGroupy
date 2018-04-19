import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {Nav, Platform, App, ViewController, Events} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {NativeStorage} from '@ionic-native/native-storage';
import {SQLite} from 'ionic-native';
import {SQLiteObject} from '@ionic-native/sqlite';
import {Autostart} from '@ionic-native/autostart';
import {AppMinimize} from '@ionic-native/app-minimize';
import * as io from 'socket.io-client';
import {Geolocation} from '@ionic-native/geolocation';
import {Diagnostic} from '@ionic-native/diagnostic';

import {LocalDatabaseProvider} from '../providers/local-database/local-database';
import {PhoneNumberRegisterProvider} from '../providers/phone-number-register/phone-number-register';
import {ContactsProvider} from '../providers/contacts/contacts';
import {GroupProvider} from '../providers/group/group';
import {ChatsProvider} from '../providers/chats/chats';
import {NetworkProvider} from '../providers/network/network';
import {ApiProvider} from '../providers/api/api';
import {ProfileProvider} from '../providers/profile/profile';
//   "@ionic-native/push": "^4.5.2",
declare var google : any;
declare var require : any;

declare var angular : any;
declare var cordova : any;
@Component({templateUrl: 'app.html'})

export class MyApp {
  @ViewChild(Nav)nav : Nav;
  rootPage : string;
  contacts : any = [];
  messages : any = [];
  isRecieved : boolean;
  groupIds : any = [];

  constructor(public platform : Platform, public detectorRef : ChangeDetectorRef, public statusBar : StatusBar, public events : Events, public app : App, private autostart : Autostart, private appMinimize : AppMinimize, public nativeStorage : NativeStorage, private geolocation : Geolocation, public groupProvider : GroupProvider, public localDb : LocalDatabaseProvider, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public contactsProvider : ContactsProvider, public chatsProvider : ChatsProvider, public networkProvider : NetworkProvider, public apiProvider : ApiProvider, private diagnostic : Diagnostic, public profile : ProfileProvider) {
    platform
      .ready()
      .then(() => {
        statusBar.styleDefault();
        this
          .autostart
          .enable();
        // cordova   .plugins   .locationAccuracy   .canRequest(function (canRequest) {
        // console.log("canRequest.....", canRequest);     if (canRequest) { cordova
        // .plugins         .locationAccuracy         .request(function () {
        // console.log("Request successful");         }, function (error) {
        // console.error("Request failed");           if (error) {   // Android only
        // console.error("error code=" + error.code + "; error message=" +
        // error.message);             if (error.code !==
        // cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {               if
        // (window.confirm("Failed to automatically set Location Mode to 'High
        // Accuracy'. Would you like to " +                   "switch to the Location
        // Settings page and do this manually?")) {                 cordova .plugins
        // .diagnostic .switchToLocationSettings();    }             }       } },
        // cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will
        // ignore this         );     }   }); this   .geolocation .getCurrentPosition()
        // .then((resp) => {     console.log("lat long............", resp);   })
        this.getLocation();
        this.initializeApp();
        this.createDatabase();
        this.receiveMsgAfterNetwokOn(); // msg send recieve
        this
          .apiProvider
          .socket
          .on('receiver_ack_response', data => {
            // console.log("receiver_ack_response ...", data);
          });

        let successCallback = (isAvailable) => {
          // console.log('Is available? ' + isAvailable);
          if (!isAvailable) {
            this
              .diagnostic
              .switchToLocationSettings();
          }
        };
        let errorCallback = (e) => console.error(e, "loc error");
        this
          .diagnostic
          .isLocationEnabled()
          .then(successCallback)
          .catch(errorCallback);

        if (this.phoneNumberRegisterProvider.user_id != undefined) {
          let obj = {
            id: this.phoneNumberRegisterProvider.user_id,
            is_online: 1,
            last_seen: new Date()
          }
          this
            .apiProvider
            .socket
            .emit('online_offline_status', obj);
        }

        setTimeout(() => {
          this
            .networkProvider
            .watchOnline()
            .subscribe(data => {
              this.isRecieved = false;
              //this.apiProvider.socket = io('http://192.168.88.14:3322');
              this.apiProvider.socket = io('http://103.43.152.210:3322');

              if (data.type == "online") {
                this
                  .localDb
                  .sendSavedMsg()
                  .then(data => {})
                this.receiveMsgAfterNetwokOn();
                this
                  .getChatLists()
                  .then(data => {}, err => {})
              }
            }, err => {
              console.log("connect internet..", err);
            });
        }, 6000);

        this.backButton();
      });

    platform
      .resume
      .subscribe(() => {
        // do something meaningful when the app is put in the foreground
        if (this.phoneNumberRegisterProvider.user_id != undefined) {
          let obj = {
            id: this.phoneNumberRegisterProvider.user_id,
            is_online: 1,
            last_seen: new Date()
          }
          this
            .apiProvider
            .socket
            .emit('online_offline_status', obj);
        }
      });

    platform
      .pause
      .subscribe(() => {
        // do something meaningful when the app is put in the on
        if (this.phoneNumberRegisterProvider.user_id != undefined) {
          let obj = {
            id: this.phoneNumberRegisterProvider.user_id,
            is_online: 0,
            last_seen: new Date()
          }
          this
            .apiProvider
            .socket
            .emit('online_offline_status', obj);
        }

      });

  }

  getLocation() {
    this
      .geolocation
      .getCurrentPosition()
      .then((resp) => {
        console.log(resp, "current locatio");
         this.localDb.current_lat = resp.coords.latitude; 
         this.localDb.current_lng =resp.coords.longitude;
        // this.localDb.current_lat = 23.8859;
        // this.localDb.current_lng = 45.0792;
        // while makimg build
        let parms = {
          lat: this.localDb.current_lat,
          lng: this.localDb.current_lng,
          user_id: this.phoneNumberRegisterProvider.user_id
        }
        this
          .profile
          .update_location(parms)
          .subscribe(res => {
            console.log("update location", res, parms)
          }, err => {
            console.log("err", err)
          })
        let lat = resp.coords.latitude;
        let lng = resp.coords.longitude;

        let geocoder = new google
          .maps
          .Geocoder();
        let latlng = new google
          .maps
          .LatLng(lat, lng);
        let request = {
          latLng: latlng
        };

        geocoder.geocode(request, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {

            let result = results[0];
            let rsltAdrComponent = result.address_components;
            let resultLength = rsltAdrComponent.length;
            if (result != null) {

              var components = results[0].address_components;

              this.localDb.current_location = rsltAdrComponent[resultLength - 8].short_name + rsltAdrComponent[resultLength - 7].short_name;

              for (var component = 0; component < (components.length); component++) {

                if (components[component].types[0] == "country") {
                  this.displayCountry(components[component].long_name);
                }
              }
            } else {
              console.log("No address available!");
            }
          }
        });
      })
      .catch((error) => {
        console.log('Error getting location', error);
      });

  }
  initializeApp() {
    this
      .phoneNumberRegisterProvider
      .getUser()
      .then(data => {
        this.rootPage = "TabsPage";
        console.log("user data.........", data);

        this.phoneNumberRegisterProvider.user_id = data.id;
        this.phoneNumberRegisterProvider.user_name = data.username;
        this.phoneNumberRegisterProvider.country_code = data.country_code;
        this.phoneNumberRegisterProvider.mobile_no = data.mobile_no;
        this.phoneNumberRegisterProvider.profile_picture = data.profile_picture;
        this.phoneNumberRegisterProvider.nickname = data.nickname;
        this.fetchContacts();
       // debugger;
        this.phoneNumberRegisterProvider.arr2 = [];
        this
          .phoneNumberRegisterProvider
          .getGroupCounterArray()
          .then(data => {
            console.log("getGroupCounterArray", data);
            var newArr = [];
            angular.forEach(data, function (value, key) {
              var exists = false;
              angular.forEach(newArr, function (val2, key) {
                if (angular.equals(value.thread_id, val2.thread_id)) {
                  exists = true
                };
              });
              if (exists == false && value.thread != "") {
                newArr.push(value);
              }
            });

            console.log("newArr", newArr);
            this
              .phoneNumberRegisterProvider
              .checkMessageCounter(newArr)
              .subscribe(data => {
                console.log("checkMessageCounter chat list", data);
                let res = data.data;
                this.phoneNumberRegisterProvider.groupCountRes = res;
                for (let x in res) {

                  console.log("this.phoneNumberRegisterProvider.groupCounter ..", this.phoneNumberRegisterProvider.groupCounter);
                  console.log(res[x]);
                  if (res[x].counter != 0) {

                    if (this.phoneNumberRegisterProvider.arr2.length != 0) { // arr already has value
                      for (let y in this.phoneNumberRegisterProvider.arr2) {
                        if (this.phoneNumberRegisterProvider.arr2[y].thread_id == res[x].thread_id) {} else {
                          this
                            .phoneNumberRegisterProvider
                            .arr2
                            .push(res[x])
                        }
                      }
                    } else {
                      // frst time entry
                      this
                        .phoneNumberRegisterProvider
                        .arr2
                        .push(res[x])
                    }
                  }
                }

                this
                  .events
                  .publish('groupbadge:updated', this.phoneNumberRegisterProvider.arr2.length);

                this.getPublicGroups();
                this.getPrivateGroups();
              })
          }, err => {
            this.getPublicGroups();
            this.getPrivateGroups();
          })
      }, err => {
        console.log(err);
        this.rootPage = "RegistrationPage";
      })
  }

  /** get public groups*/
  getPublicGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 0
    }
    this
      .groupProvider
      .getUserGroups(requestParams)
      .subscribe(data => {

        this.localDb.publicGroups = data.data;
        for (let x in this.localDb.publicGroups) {
          var crypto = require("crypto");
          var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq')
          var dec = decipher.update(this.localDb.publicGroups[x].message, 'hex', 'utf8');
          this.localDb.publicGroups[x].message = dec;
          let obj = {
            thread_id: this.localDb.publicGroups[x].thread_id,
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.localDb.publicGroups[x].id
          }
          this
            .apiProvider
            .socket
            .emit('subscribe', obj);
          this
            .phoneNumberRegisterProvider
            .groupArrayCounter
            .push({thread_id: this.localDb.publicGroups[x].thread_id, chat_id: this.localDb.publicGroups[x].cid})
        }
        console.log("group acounter", this.phoneNumberRegisterProvider.groupArrayCounter)
        this
          .phoneNumberRegisterProvider
          .setGroupCounterArray(this.phoneNumberRegisterProvider.groupArrayCounter);
        if (data.data.length != 0) {
          for (let d in data.data) {
            this
              .phoneNumberRegisterProvider
              .groupIds
              .push(data.data[d].id);
          }

        }
      }, err => {})
  }

  /** get private groups */
  getPrivateGroups() {
    let requestParams = {
      user_id: this.phoneNumberRegisterProvider.user_id,
      group_type: 1
    }
    this
      .groupProvider
      .getUserGroups(requestParams)
      .subscribe(data => {

        this.localDb.privateGroups = data.data;
        for (let x in this.localDb.privateGroups) {
          var crypto = require("crypto");
          var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq')
          var dec = decipher.update(this.localDb.privateGroups[x].message, 'hex', 'utf8');
          this.localDb.privateGroups[x].message = dec;
          let obj = {
            thread_id: this.localDb.privateGroups[x].thread_id,
            sender: this.phoneNumberRegisterProvider.user_id,
            receiver: this.localDb.privateGroups[x].id
          }
          this.apiProvider.socket
          //   .emit('subscribe', obj); this   .phoneNumberRegisterProvider
          // .groupArrayCounter   .push({thread_id:
          // this.localDb.publicGroups[x].thread_id, chat_id:
          // this.localDb.publicGroups[x].cid})
        }
        // console.log("group acounter",
        // this.phoneNumberRegisterProvider.groupArrayCounter) this
        // .phoneNumberRegisterProvider
        // .setGroupCounterArray(this.phoneNumberRegisterProvider.groupArrayCounter);
        if (data.data.length != 0) {
          for (let d in data.data) {
            this
              .phoneNumberRegisterProvider
              .groupIds
              .push(data.data[d].id);
            // this.phoneNumberRegisterProvider.privateGroupCounterArray.push({thread_id:dat
            // a.data[d].thread_id,chat_id:})
          }
          // console.log("Ids ", this.groupIds)
        }

      }, err => {
        console.log("getPrivateGroups", err)
      })
  }

  displayCountry(count) {
    let selected_country = this
      .phoneNumberRegisterProvider
      .countryCodes
      .filter(country => country.name == count);
    // console.log(selected_country);
    this.phoneNumberRegisterProvider.code = "+" + selected_country[0].code;
    this.phoneNumberRegisterProvider.country_name = selected_country[0].name;

  }

  // fetch contacts on run application
  fetchContacts() {
    // console.log(this.phoneNumberRegisterProvider.country_code)
    if (this.phoneNumberRegisterProvider.country_code != undefined) {
      this.contactsProvider.contactsfound = [];
      this
        .contactsProvider
        .fetchContactsFromMobile();
    }
  }

  createDatabase() {
    this.localDb.db = new SQLite();
    this
      .localDb
      .db
      .openDatabase({name: "getGroupy.db", location: "default"})
      .then(() => {}, (error) => {
        console.error("Unable to open database", error);
      });

  }

  backButton() {
    var lastTimeBackPress = 0;
    var timePeriodToExit = 2000;
    this
      .platform
      .registerBackButtonAction(() => {

        let view = this
          .app
          .getActiveNav()
          .getViews()
          .length;

        let nav = this
          .app
          .getActiveNav();
        if (view == 1) {
          if (this.nav.canGoBack()) {
            this
              .nav
              .pop({});
          } else {
            nav
              .parent
              .select(0);
            this
              .appMinimize
              .minimize();
          }
        } else if (view != 1) {
          let nav = this
            .app
            .getActiveNav();
          let activeView : ViewController = nav.getActive();

          if (activeView != null) {
            if (nav.canGoBack()) 
              nav.pop();
            else 
              nav
                .parent
                .select(0); // goes to the first tab
            }
          }
      });
  }

  getChatLists() {
    return new Promise((resolve, reject) => {
      this
        .localDb
        .db
        .executeSql("SELECT * FROM Contacts", [])
        .then((data) => {
          this.contacts = [];
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
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
                    .photo
                });
            }

            this
              .chatsProvider
              .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
              .subscribe(data => {
                console.log("getChatLists", data);
                this.localDb.chatList = [];
                if (data.data.length != 0) {
                  for (let m in data.data) {
                    let obj = {
                      thread_id: data.data[m].thread_id,
                      sender: this.phoneNumberRegisterProvider.user_id,
                      receiver: data.data[m].userID
                    }
                    if (this.localDb.subsribeThread_ids.length != 0) {
                      if (this.localDb.subsribeThread_ids.filter(threadId => threadId == data.data[m].thread_id).length == 0) {
                        this
                          .apiProvider
                          .socket
                          .emit('subscribe', obj);
                        this
                          .localDb
                          .subsribeThread_ids
                          .push(data.data[m].thread_id);
                      } else {}
                    } else {

                      this
                        .apiProvider
                        .socket
                        .emit('subscribe', obj);
                      this
                        .localDb
                        .subsribeThread_ids
                        .push(data.data[m].thread_id);
                    }

                    // this.apiProvider.socket.emit('subscribe', data.data[m].thread_id);
                    var crypto = require("crypto");
                    var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq')
                    var dec = decipher.update(data.data[m].message, 'hex', 'utf8');

                    let isContactAvailable = false;
                    for (let c in this.contacts) {
                      if (this.contacts[c].mobile_no == data.data[m].mobile_no) {
                        this
                          .localDb
                          .chatList
                          .push({
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
                            cid: data.data[m].cid

                          })
                        for (let z in this.localDb.chatList) {
                          this
                            .phoneNumberRegisterProvider
                            .chatArrayCounter
                            .push({thread_id: this.localDb.chatList[z].thread_id, chat_id: this.localDb.chatList[z].cid})
                        }
                        console.log("chat counter array.", this.phoneNumberRegisterProvider.chatArrayCounter);
                        this
                          .phoneNumberRegisterProvider
                          .setChatCounterArray(this.phoneNumberRegisterProvider.chatArrayCounter);
                        isContactAvailable = true;
                        break;
                      }
                    }
                    if (!isContactAvailable) 
                      this.localDb.chatList.push({
                        lastMessage: dec,
                        thread_id: data.data[m].thread_id,
                        userId: data.data[m].userID,
                        name: data.data[m].mobile_no,
                        mobileNo: data.data[m].mobile_no,
                        photos: data.data[m].profile_picture,
                        sent: true,
                        is_online: data.data[m].is_online,
                        last_seen: data.data[m].last_seen,
                        message_time: data.data[m].message_time,
                        seen_count: data.data[m].seen_count,
                        sender_id: data.data[m].sender_id,
                        cid: data.data[m].cid

                      })
                    for (let z in this.localDb.chatList) {
                      this
                        .phoneNumberRegisterProvider
                        .chatArrayCounter
                        .push({thread_id: this.localDb.chatList[z].thread_id, chat_id: this.localDb.chatList[z].cid})
                    }
                    console.log("chat counter array.", this.phoneNumberRegisterProvider.chatArrayCounter);
                    this
                      .phoneNumberRegisterProvider
                      .setChatCounterArray(this.phoneNumberRegisterProvider.chatArrayCounter);
                    this.localDb.noChats = false;
                  }
                  this
                    .localDb
                    .saveChatList(this.localDb.chatList);

                } else {
                  this.localDb.noChats = true;
                }

              }, err => {
                console.log(err);
                this
                  .localDb
                  .getChatList();
              })
          } else {
            this
              .chatsProvider
              .getChatLists({user_id: this.phoneNumberRegisterProvider.user_id})
              .subscribe(data => {

                this.localDb.chatList = [];
                if (data.data.length != 0) {
                  for (let m in data.data) {
                    var crypto = require("crypto");
                    var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq')
                    var dec = decipher.update(data.data[m].message, 'hex', 'utf8');
                    this
                      .localDb
                      .chatList
                      .push({
                        lastMessage: dec,
                        thread_id: data.data[m].thread_id,
                        userId: data.data[m].userID,
                        name: data.data[m].mobile_no,
                        mobileNo: data.data[m].mobile_no,
                        photos: data.data[m].profile_picture,
                        sent: true,
                        message_time: data.data[m].message_time,
                        seen_count: data.data[m].seen_count,
                        sender_id: data.data[m].sender_id,
                        cid: data.data[m].cid

                      })
                    for (let z in this.localDb.chatList) {
                      //this.phoneNumberRegisterProvider.chatArrayCounter = [];
                      this
                        .phoneNumberRegisterProvider
                        .chatArrayCounter
                        .push({thread_id: this.localDb.chatList[z].thread_id, chat_id: this.localDb.chatList[z].cid})
                    }
                    console.log("chat counter array.", this.phoneNumberRegisterProvider.chatArrayCounter);
                    this
                      .phoneNumberRegisterProvider
                      .setChatCounterArray(this.phoneNumberRegisterProvider.chatArrayCounter);
                    this.localDb.noChats = false;
                  }
                  this
                    .localDb
                    .saveChatList(this.localDb.chatList);
                } else {
                  this.localDb.noChats = true;
                }

              }, err => {
                console.log(err);
              })
          }
        }, (error) => {
          console.log("ERROR: " + JSON.stringify(error));
        });
    });
  }
  reverse_array(msg) {
    //console.log(msg,"reversing")
    msg
      .sort(function (a, b) {
        //   console.log(a.id,b.id,"ab")
        return a.id - b.id
      })
    //  console.log(msg,"after  reverse")

  }

  receiveMsgAfterNetwokOn() {
    console.log("thread id before message ", this.localDb.thread_id);
    this
      .apiProvider
      .socket
      .on('message', x => {
        console.log("message aya.......", x)
        //

        if (this.localDb.firstTime) { // save thread in case of first time chat start
          this.localDb.firstTime = false;
          this.localDb.thread_id = x.thread_id;
        }
        if (x.msgs.length != undefined) {
          //  on load check whether array or object

          if (x.msgs.length == 0) {} else {
            //console.log("chuck msgs", x) console.log(this.localDb.mes\sagesShow,"first")
            this.localDb.total_page = x.page_num;
            if (this.localDb.messagesShow.length == 0) {
              var length = x.msgs.length;
              this.localDb.length = x.msgs.length;
              //  console.log("empty array")
              this.reverse_array(x.msgs);
            }

            for (let msg of x.msgs) {

              for (let cont of this.localDb.contacts) {

                if (cont.userId == msg.sender) {

                  msg.sender_name = cont.name
                }

              }
              var crypto = require("crypto");
              var decipher = crypto.createDecipher('aes-256-ctr', 'd6F3Efeq')
              var dec = decipher.update(msg.message, 'hex', 'utf8');
              if (!this.localDb.isRecieved) {
                //   console.log("!this.localDb.isRecieved")
                if (this.localDb.thread_id == msg.thread_id) {
                  //    console.log("this.localDb.thread_id == x.msgs[m].thread_id")

                  this
                    .localDb
                    .saveChatByUserId({
                      msg: dec,
                      sender_id: msg.sender,
                      reciever_id: msg.receiver,
                      thread_id: msg.thread_id,
                      id: msg.id,
                      time: msg.time,
                      sent: true,
                      members_count: msg.members_count,
                      receiver_count: msg.receiver_count,
                      seen_count: msg.seen_count,
                      sender_name: msg.sender_name,
                      is_visible: msg.is_visible,
                      profile_picture: msg.profile_picture,
                      nickname: msg.nickname,
                      user_is_visible: msg.user_is_visible
                    })
                    .then(data => {
                      console.log("then", data)
                      let d = JSON.parse(JSON.stringify(data))
                      if (d.inserted) {
                        //  console.assert   console.log("then if")

                        if (d.msg.members_count != d.msg.receiver_count && d.msg.reciever_id == this.phoneNumberRegisterProvider.user_id) 
                          this.ackReceiveMessageStatus(d.msg);
                        
                        if (d.msg.members_count != d.msg.seen_count && d.msg.reciever_id == this.phoneNumberRegisterProvider.user_id) 
                          this.ackSeenMessageStatus(d.msg);
                        if (!this.localDb.messagesShow.find(t => {
                          if (d.msg.id == t.id) {
                            t.receiver_count = d.msg.receiver_count;
                            t.seen_count = d.msg.seen_count;
                            return t;
                          }
                        })) 
                          this.localDb.messagesShow.push(d.msg);
                        this
                          .events
                          .publish('message:pushed');
                      } else {
                        //     console.log("last else")
                        if (d.msg.members_count != d.msg.receiver_count && d.msg.reciever_id == this.phoneNumberRegisterProvider.user_id) 
                          this.ackReceiveMessageStatus(d.msg);
                        if (d.msg.members_count != d.msg.seen_count && d.msg.reciever_id == this.phoneNumberRegisterProvider.user_id) 
                          this.ackSeenMessageStatus(d.msg);
                        if (!this.localDb.messagesShow.find(t => {
                          if (d.msg.id == t.id) {
                            t.receiver_count = d.msg.receiver_count;
                            t.seen_count = d.msg.seen_count;
                            return t;
                          }
                        })) 

                          if (this.localDb.messagesShow.length < 50) {
                            this
                              .localDb
                              .messagesShow
                              .push(d.msg);
                          }
                        else {
                          this
                            .localDb
                            .messagesShow
                            .splice(0, 0, d.msg);
                        }

                      }

                    }, err => {
                      console.log("then err", err)
                    })

                }
              }
            }
            console.log("chunk message create array......", this.localDb.messagesShow);

          }
        } else { // single msg show time

          this.localDb.show = true;
          console.log("single msgs", x);
          console.log("thread id..", this.localDb.thread_id)
          if (x.msgs) {
            if (this.localDb.thread_id == x.thread_id) {
              // thread id exists (inside view)
              this
                .localDb
                .saveChatByUserId({
                  msg: x.msgs.message,
                  sender_id: x.msgs.sender,
                  reciever_id: x.msgs.receiver,
                  thread_id: x.msgs.thread_id,
                  id: x.msgs.id,
                  time: x.msgs.time,
                  sent: true,
                  members_count: x.msgs.members_count,
                  receiver_count: x.msgs.receiver_count,
                  seen_count: x.msgs.seen_count,
                  sender_name: x.msgs.sender_name,
                  is_visible: x.msgs.is_visible,
                  profile_picture: x.msgs.profile_picture,
                  nickname: x.msgs.nickname,
                  data_chat_type: x.msgs.data_chat_type,
                  user_is_visible: x.msgs.user_is_visible
                })
                .then(data => {
                  console.log("data", data);
                  let d = JSON.parse(JSON.stringify(data));

                  if (d.inserted) {

                    if (this.phoneNumberRegisterProvider.user_id != x.msgs.sender) {
                      this.ackReceiveMessageStatus(d.msg);
                      this.ackSeenMessageStatus(d.msg);
                    }
                    this
                      .localDb
                      .messagesShow
                      .push(d.msg);

                  } else {

                    if (!this.localDb.messagesShow.find(t => {
                      if (d.msg.id == t.id) {
                        t.receiver_count = d.msg.receiver_count;
                        t.seen_count = d.msg.seen_count;
                        return t;
                      }
                    })) 
                      this.localDb.messagesShow.push(d.msg);
                    }
                  
                }, err => {
                  console.log("then err", err)
                })

            } else {
              // thread id doesnt exist (outside view is chatlist);

              this
                .localDb
                .saveChatByUserId({
                  msg: x.msgs.message,
                  sender_id: x.msgs.sender,
                  reciever_id: x.msgs.receiver,
                  thread_id: x.msgs.thread_id,
                  id: x.msgs.id,
                  time: x.msgs.time,
                  sent: true,
                  members_count: x.msgs.members_count,
                  receiver_count: x.msgs.receiver_count,
                  seen_count: x.msgs.seen_count,
                  sender_name: x.msgs.sender_name,
                  is_visible: x.msgs.is_visible,
                  profile_picture: x.msgs.profile_picture,
                  nickname: x.msgs.nickname,
                  data_chat_type: x.msgs.data_chat_type,
                  user_is_visible: x.msgs.user_is_visible
                })
                .then(data => {
                  let d = JSON.parse(JSON.stringify(data));

                  if (d.inserted) {

                    if (this.phoneNumberRegisterProvider.user_id != x.msgs.sender) {
                      this.ackReceiveMessageStatus(d.msg);
                    }
                    // if(this.)
                    this
                      .localDb
                      .messagesShow
                      .push(d.msg);

                  } else {

                    if (!this.localDb.messagesShow.find(t => {

                      if (d.msg.id == t.id) {
                        t.receiver_count = d.msg.receiver_count;
                        t.seen_count = d.msg.seen_count;
                        return t;
                      }
                    })) 
                      this.localDb.messagesShow.push(d.msg);

                    }
                  
                }, err => {
                  console.log("then err")
                })
            }
          }

          this.localDb.isRecieved = true;
          console.log(x.msgs.data_chat_type, "x.msgs.data_chat_type");
          if (x.msgs.data_chat_type == 0) {
            console.log()
            //  debugger;
            this.phoneNumberRegisterProvider.arr = [];
            this
              .phoneNumberRegisterProvider
              .getChatCounterArray()
              .then(data => {
                console.log("getChatCounterArray", data);
                var newArr = [];
                angular.forEach(data, function (value, key) {
                  var exists = false;
                  angular.forEach(newArr, function (val2, key) {
                    if (angular.equals(value.thread_id, val2.thread_id)) {
                      exists = true
                    };
                  });
                  if (exists == false && value.thread != "") {
                    newArr.push(value);
                  }
                });

                console.log("newArr", newArr);
                this
                  .phoneNumberRegisterProvider
                  .checkMessageCounter(newArr)
                  .subscribe(data => {
                    console.log("checkMessageCounter chat list", data);
                    let res = data.data;
                    this.phoneNumberRegisterProvider.chatCountRes = res;
                    for (let x in res) {

                      console.log("this.phoneNumberRegisterProvider.chatCounter ..", this.phoneNumberRegisterProvider.chatCounter);
                      console.log(res[x]);
                      if (res[x].counter != 0) {

                        if (this.phoneNumberRegisterProvider.arr.length != 0) { // arr already has value
                          for (let y in this.phoneNumberRegisterProvider.arr) {
                            if (this.phoneNumberRegisterProvider.arr[y].thread_id == res[x].thread_id) {} else {
                              this
                                .phoneNumberRegisterProvider
                                .arr
                                .push(res[x])
                            }
                          }
                        } else {
                          // frst time entry
                          this
                            .phoneNumberRegisterProvider
                            .arr
                            .push(res[x])
                        }
                      }
                    }

                    this
                      .events
                      .publish('chatbadge:updated', this.phoneNumberRegisterProvider.arr.length);
                    this.getChatLists();
                  })
              })
          } else {

            //   debugger;
            this.phoneNumberRegisterProvider.arr2 = [];
            this
              .phoneNumberRegisterProvider
              .getGroupCounterArray()
              .then(data => {
                console.log("getGroupCounterArray", data);
                var newArr = [];
                angular.forEach(data, function (value, key) {
                  var exists = false;
                  angular.forEach(newArr, function (val2, key) {
                    if (angular.equals(value.thread_id, val2.thread_id)) {
                      exists = true
                    };
                  });
                  if (exists == false && value.thread != "") {
                    newArr.push(value);
                  }
                });

                console.log("newArr", newArr);
                this
                  .phoneNumberRegisterProvider
                  .checkMessageCounter(newArr)
                  .subscribe(data => {
                    console.log("checkMessageCounter grouplist", data);
                    let res = data.data;
                    this.phoneNumberRegisterProvider.groupCountRes = res;
                    for (let x in res) {
                      console.log(res[x]);
                      if (res[x].counter != 0) {

                        if (this.phoneNumberRegisterProvider.arr2.length != 0) { // arr already has value
                          for (let y in this.phoneNumberRegisterProvider.arr2) {
                            if (this.phoneNumberRegisterProvider.arr2[y].thread_id == res[x].thread_id) {} else {
                              this
                                .phoneNumberRegisterProvider
                                .arr2
                                .push(res[x])
                            }
                          }
                        } else {
                          // frst time entry
                          this
                            .phoneNumberRegisterProvider
                            .arr2
                            .push(res[x])
                        }
                      }
                    }
                    console.log(" this.phoneNumberRegisterProvider.arr2 ", this.phoneNumberRegisterProvider.arr2);
                    var newArr2 = [];
                    angular.forEach(this.phoneNumberRegisterProvider.arr2, function (value, key) {
                      var exists = false;
                      angular.forEach(newArr2, function (val2, key) {
                        if (angular.equals(value.thread_id, val2.thread_id)) {
                          exists = true
                        };
                      });
                      if (exists == false && value.thread != "") {
                        newArr2.push(value);
                      }
                    });

                    console.log("newArr2", newArr2);
                    this
                      .events
                      .publish('groupbadge:updated', newArr2.length);
                    this.getPublicGroups();
                    this.getPrivateGroups();
                  })
              })
          }

        }
      });
  }

  /** acknowledge recive message status */
  ackReceiveMessageStatus(chat) {

    this
      .apiProvider
      .socket
      .emit('receiver_ack', {
        chat_id: chat.id,
        receiver_count: 1,
        seen_count: 0,
        room: chat.thread_id
      });
  }

  /** acknowledge recive message status */
  ackSeenMessageStatus(chat) {

    this
      .apiProvider
      .socket
      .emit('receiver_ack', {
        chat_id: chat.id,
        receiver_count: 0,
        seen_count: 1,
        room: chat.thread_id
      });
  }
}
