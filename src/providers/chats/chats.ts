import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {ApiProvider} from '../api/api';

@Injectable()
export class ChatsProvider {
  chatList : any = [];
  noChats : boolean = true;
  constructor(public http : Http, public apiProvider : ApiProvider) {
    console.log('Hello ChatsProvider Provider');
  }

  //Get chat lists
  getChatLists(body : Object) {

    let bodyString = JSON.stringify(body);
    console.log(bodyString);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this
      .http
      .post(this.apiProvider.stagingUrl + 'get_chat_threads', body, options)
      .map((res : Response) => res.json())
      .catch((error : any) => Observable.throw(error.json().error || error));
  }

}
