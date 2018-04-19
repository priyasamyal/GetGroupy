import {Injectable} from '@angular/core';
import {Http, RequestOptions, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import * as io from 'socket.io-client';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ApiProvider {
  socket : any;
  public stagingUrl = "http://103.43.152.210:2311/api/";
  public imageUrl = "http://103.43.152.210:2311/images/profile_image/";

  // public stagingUrl = "http://192.168.88.14:2311/api/"; public imageUrl =
  // "http://192.168.88.14:2311/images/profile_image/";

  constructor(public http : Http) {
    console.log('Hello ApiProvider Provider');
    //this.socket = io('http://192.168.88.14:3322');
    this.socket = io('http://103.43.152.210:3322');
  }
}
