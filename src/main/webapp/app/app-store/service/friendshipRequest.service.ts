import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import SockJS = require('sockjs-client');
import Stomp = require('webstomp-client');

import { friendRequestReason, FriendshipRequest } from '../../friend-control/friend-control-model/friend-request-model';
import { Principal } from '../../shared';
import { AuthServerProvider } from '../../shared/auth/auth-jwt.service';
import { CSRFService } from '../../shared/auth/csrf.service';
import { WindowRef } from '../../shared/tracker/window.service';

@Injectable()
/**Socket for friendship request
 * - HTTP WEB SOCKET SERVICE
 */
export class FriendshipRequestService {
    stompClient = null;
    subscriber = null;
    connection: Promise<any>;
    connectedPromise: any;
    listener: Observable<any>; // use to get the new request
    // use to publish the new request after arrived, then use can get through listener
    listenerObserver: Observer<any>;
    alreadyConnectedOnce = false;
    private subscription: Subscription;

    constructor(
        private router: Router,
        private authServerProvider: AuthServerProvider,
        private $window: WindowRef,
        private csrfService: CSRFService,
        private principalService: Principal
    ) {
        this.connection = this.createConnection();
        this.listener = this.createListener();
        this.connect(); // connect to the service
    }

    /**Connect to service */
    private connect() {
        if (this.connectedPromise === null) {
            this.connection = this.createConnection();
        }
        // building absolute path so that websocket doesnt fail when deploying with a context path
        const loc = this.$window.nativeWindow.location;
        let url = '//' + loc.host + loc.pathname + 'websocket/addFriend';
        const authToken = this.authServerProvider.getToken();
        if (authToken) {
            url += '?access_token=' + authToken;
        }
        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);
        const headers = {};
        this.stompClient.connect(headers, () => {
            this.connectedPromise('success');
            this.connectedPromise = null;
            this.subscribe();
            if (!this.alreadyConnectedOnce) {
                this.alreadyConnectedOnce = true;
            }
        });
    }

    private disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.alreadyConnectedOnce = false;
    }

    /**Get the request from service */
    receive() {
        return this.listener;
    }

    /***Send the requsest to service */
    sendFriendRequest(friendShipRequst: FriendshipRequest) {
        const selfLogin = this.principalService.getUserLogin();
        const selfID = this.principalService.getUserID();
        if (!selfLogin || selfID < 0)
            throw Error('Please login');
        const reqBody = this.createRqustObject(
            selfID,
            selfLogin,
            selfID,
            selfLogin,
            friendShipRequst.introduceUserIDId,
            friendShipRequst.introduceUserIDLogin,
            friendShipRequst.reason);

        if (this.stompClient !== null && this.stompClient.connected) {
            this.stompClient.send(
                '/addFriend/req', // destination
                JSON.stringify(reqBody), // body
                {} // header
            );
        }
    }

    private subscribe() {
        this.connection.then(() => {
            this.subscriber = this.stompClient.subscribe('/addFriend/' + this.principalService.getUserLogin(), (data) => {
                this.listenerObserver.next(JSON.parse(data.body));
            });
        });
    }

    private unsubscribe() {
        if (this.subscriber !== null) {
            this.subscriber.unsubscribe();
        }
        this.listener = this.createListener();
    }

    private createListener(): Observable<any> {
        return new Observable((observer) => {
            this.listenerObserver = observer;
        });
    }

    private createConnection(): Promise<any> {
        return new Promise((resolve, reject) => this.connectedPromise = resolve);
    }

    private createRqustObject(
        introByID: number,
        introByLogin: string,
        introToID: number,
        introToLogin: string,
        introUserID: number,
        introUserLogin: string,
        requestReason: friendRequestReason
    ): FriendshipRequest {
        return {
            time: new Date(),
            reason: requestReason,
            introduceByLogin: introByLogin,
            introduceById: introByID,
            introduceToLogin: introToLogin,
            introduceToId: introToID,
            introduceUserIDLogin: introUserLogin,
            introduceUserIDId: introUserID,
        };
    }

    // keepSubcribe() {
    //   this.receive().subscribe((response: FriendshipRequest) => {
    //     this.friendControlReceiveRequest(response);
    //   });
    // }

    // @dispatch()
    // friendControlReceiveRequest(response) {
    //   return createSendRequstAction(FriendControlActionsList.NEW_REQUEST, { dataStatus: StoreDataStatus.COMPLETE }, response);
    // }

}
