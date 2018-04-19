import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Network } from 'ionic-native';
import { Platform } from 'ionic-angular';

declare var Connection;

@Injectable()
export class NetworkProvider {
  onDevice: boolean;
  constructor(public http: Http, public platform: Platform) {
    console.log('Hello NetworkProvider Provider');
    this.onDevice = this.platform.is('cordova');
  }

  isOnline() {
    if (this.onDevice && Network.type) {
      return Network.type !== Connection.NONE;
    } else {
      return navigator.onLine;
    }
  }

  isOffline() {
    if (this.onDevice && Network.type) {
      return Network.type === Connection.NONE;
    } else {
      return !navigator.onLine;
    }
  }

  watchOnline() {
    return Network.onConnect();
  }

  watchOffline() {
    return Network.onDisconnect();
  }
}
