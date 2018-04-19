import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';

import {ApiProvider} from '../api/api';
import {PhoneNumberRegisterProvider} from '../../providers/phone-number-register/phone-number-register';
import {LocalDatabaseProvider} from '../../providers/local-database/local-database';

import {CreateGroupSecondStepModel} from '../../pages/create-group-second-step/create-group-second-step.model';

@Injectable()
export class GroupProvider {

  constructor(public http : Http, public apiProvider : ApiProvider, private transfer : FileTransfer, private file : File, public phoneNumberRegisterProvider : PhoneNumberRegisterProvider, public localDb : LocalDatabaseProvider,) {
    console.log('Hello GroupProvider Provider');
  }

  /** New Group create with icon*/

  createGroupWithIcon(group_info) {
    console.log("icon", group_info.group_icon);
    console.log("object to sned with icon", JSON.stringify(group_info));
    return new Promise((resolve, reject) => {

      var title = group_info
        .group_icon
        .substr(group_info.group_icon.lastIndexOf('/') + 1);
      console.log(title);
      var options = {
        fileKey: "group_image",
        fileName: title,
        chunkedMode: false,
        mimeType: "multipart/form-data",
        params: {
          'group_name': group_info.group_name,
          'type': group_info.type,
          'description': group_info.desc,
          'user_ids_ar': JSON.stringify(group_info.user_ids_ar),
          'admin_id': this.phoneNumberRegisterProvider.user_id,
          'lat': this.localDb.current_lat,
          'lng': this.localDb.current_lng,
          'place': this.localDb.current_location
        }
      };
      console.log("options", options)

      const fileTransfer : FileTransferObject = this
        .transfer
        .create();

      // Use the FileTransfer to upload the image
      fileTransfer
        .upload(group_info.group_icon, this.apiProvider.stagingUrl + 'create_group', options)
        .then(data => {
          console.log("fileTransfer.upload success");
          console.log(data);
          resolve(data.response);
        }, err => {
          console.log("fileTransfer.upload err");
          console.log(err);
          reject(err);
        });

    });
  }

  // New create Group withput icon
  createGroupWithoutIcon(body : Object) : Observable < CreateGroupSecondStepModel[] > {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'create_group', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  /** edit group with icon */
  editGroupWithIcon(group_info) {
    console.log("object to sned with icon", JSON.stringify(group_info));
    return new Promise((resolve, reject) => {

      var title = group_info
        .group_image
        .substr(group_info.group_image.lastIndexOf('/') + 1);
      console.log(title);
      var options = {
        fileKey: "group_image",
        fileName: title,
        chunkedMode: false,
        mimeType: "multipart/form-data",
        params: {
          'group_id': group_info.group_id,
          'group_name': group_info.group_name,
          'description': group_info.desc
        }
      };
      console.log("options", options)

      const fileTransfer : FileTransferObject = this
        .transfer
        .create();

      // Use the FileTransfer to upload the image
      fileTransfer
        .upload(group_info.group_image, this.apiProvider.stagingUrl + 'edit_group', options)
        .then(data => {
          console.log("fileTransfer.upload success");
          console.log(data);
          resolve(data.response);
        }, err => {
          console.log("fileTransfer.upload err");
          console.log(err);
          reject(err);
        });

    });
  }

  // edit  Group withput icon
  editGroupWithoutIcon(body : Object) : Observable < CreateGroupSecondStepModel[] > {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'edit_group', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  // get world groups

  getWorldGroups() {

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .get(this.apiProvider.stagingUrl + 'get_world_groups', options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  // get around me  groups

  getAroundMeGroups(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'get_groups_by_distance', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  // get users groups

  getUserGroups(body : Object) {

    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'get_groups_by_type', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  // get world groups

  getGroupDetail(body : Object) {
    this.localDb.groupDetail = [];
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'get_group_details_by_id', body, options)
      .map((res : Response) => {
        console.log(res.json())
        let response = res.json();
        console.log(response)
        // this.localDb.groupDetail = response.data;
        this.localDb.member_count = response.data.length;
        this.showFriemdsName(response.data);
        console.log("getGroupDetail", this.localDb.groupDetail);
      })
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  /** show friend name */
  showFriemdsName(data) {
    //debugger;
    for (let x in data) {
      for (let y in this.localDb.contacts) {
        //  console.log("data[x].id", data[x].id);
        // console.log("this.localDb.contacts[y].id", this.localDb.contacts[y].userId)
        this.localDb.groupDetail[x] = data[x];
        if (data[x].id == this.localDb.contacts[y].userId) {
          this.localDb.groupDetail[x].username = this.localDb.contacts[y].name;
        }
        if (this.localDb.groupDetail[x].id == this.phoneNumberRegisterProvider.user_id && this.localDb.groupDetail[x].is_admin == '1') {
          this.localDb.canRemoveMember = true;
        }
      }
    }
  }

  /** exit group  */
  ExitGroup(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'exit_group', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  /** make/remove  group  */
  MakeRemoveAdmin(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'add_remove_group_admin', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  /** add group members */
  AddGroupMembers(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'add_group_members', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  /** add group members */
  ConfirmBlockGroup(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'update_group_member_status', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  /** set visible invisible */
  SetVisibleInvisible(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'update_visible_invisible_status', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || 'Server error'));
  }

  getMyGroupContact(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiProvider.stagingUrl + 'get_my_group_users_list', body, options)
        .map(res => res.json())
        .subscribe(res => {
          if (res.status) {
            resolve(res.data);
          }
          console.log(res);

        }, err => {
          console.log(err)

          if (err.msg) 
            reject(err.msg);
          else 
            reject('Server not responding');
          }
        );
    });
  }

  getContactAroundMe(body : Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return new Promise((resolve, reject) => {
      this
        .http
        .post(this.apiProvider.stagingUrl + 'get_near_by_users_list', body, options)
        .map(res => res.json())
        .subscribe(res => {
          if (res.status) {
            resolve(res.data);
          }
          console.log(res);

        }, err => {
          console.log(err)

          if (err.msg) 
            reject(err.msg);
          else 
            reject('Server not responding');
          }
        );
    });
  }

}
