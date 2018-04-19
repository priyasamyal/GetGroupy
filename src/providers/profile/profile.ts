import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {NativeStorage} from '@ionic-native/native-storage';
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject,
} from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';

import {ApiProvider} from '../api/api';
import {RegisterModel} from '../../pages/registration/register.model';
import {VerifyOTPModel} from '../../pages/registration/verifyOtp.model';

@Injectable()
export class ProfileProvider {
  constructor(
    public http: Http,
    public apiProvider: ApiProvider,
    public nativeStorage: NativeStorage,
    private transfer: FileTransfer,
    private file: File
  ) {
    console.log('Hello ProfileProvider Provider');
  }

  /** Add profile picture*/

  editProfileIcon(user_info) {
    console.log('icon', user_info.profile_picture);
    console.log('object to sned with icon', JSON.stringify(user_info));
    return new Promise((resolve, reject) => {
      var file_name = user_info.profile_picture.split('/').pop();
      console.log(file_name);
      var options = {
        fileKey: 'profile_picture',
        fileName: file_name,
        chunkedMode: false,
        mimeType: 'multipart/form-data',
        params: {
          user_id: user_info.user_id,
        },
      };
      console.log('options', options);

      const fileTransfer: FileTransferObject = this.transfer.create();

      // Use the FileTransfer to upload the image
      fileTransfer
        .upload(
          user_info.profile_picture,
          this.apiProvider.stagingUrl + 'update_profile_picture',
          options
        )
        .then(
          data => {
            console.log('fileTransfer.upload success');
            console.log(data);
            resolve(data.response);
          },
          err => {
            console.log('fileTransfer.upload err');
            console.log(err);
            reject(err);
          }
        );
    });
  }

  /** edit profile data */
  editProfile(body: Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http
      .post(this.apiProvider.stagingUrl + 'edit_profile', body, options)
      .map((res: Response) => res.json())
      .catch((error: any) =>
        Observable.throw(error.json().error || 'Server error')
      );
  }
   /** viewFriendProfile */
    viewFriendProfile(body: Object) {
    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http
      .post(
        this.apiProvider.stagingUrl + 'get_user_details_by_id',
        body,
        options
      )
      .map((res: Response) => res.json())
      .catch((error: any) =>
        Observable.throw(error.json().error || 'Server error')
      );
  }


  /** Block Contact */
  block_contact(body: Object) {

    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

   return this.http
      .post(
        this.apiProvider.stagingUrl + 'block_user',
        body,
        options
      )
      .map((res: Response) => res.json())
      .catch((error: any) =>
        Observable.throw(error.json().error || 'Server error')
      );

  }

  /** Block Contact */
  unblock_contact(body: Object) {
    
        let bodyString = JSON.stringify(body);
        console.log(bodyString);
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
    
       return this.http
          .post(
            this.apiProvider.stagingUrl + 'unblock_user',
            body,
            options
          )
          .map((res: Response) => res.json())
          .catch((error: any) =>
            Observable.throw(error.json().error || 'Server error')
          );
    
      }

       /** Update Location */
       update_location(body: Object) {
        
            let bodyString = JSON.stringify(body);
            console.log(bodyString);
            let headers = new Headers({'Content-Type': 'application/json'});
            let options = new RequestOptions({headers: headers});
        
           return this.http
              .post(
                this.apiProvider.stagingUrl + 'update_user_lat_long ',
                body,
                options
              )
              .map((res: Response) => res.json())
              .catch((error: any) =>
                Observable.throw(error.json().error || 'Server error')
              );
        
          }

}
