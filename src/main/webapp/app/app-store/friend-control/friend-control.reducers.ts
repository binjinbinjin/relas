import { FriendshipRequest } from '../../friend-control/friend-control-model/friend-request-model';
import { StoreDataInter, StoreDataSource, StoreDataStatus } from '../app-store/app.store.model';
import { FriendshipRequestService } from '../service/friendshipRequest.service';
import { FriendControlActionRequestAction, FriendControlActionsList } from './friend-control.action';
import { INITIAL_ADD_FRIEND, INITIAL_RECEIVED_REQUEST } from './friend-control.data';

/**Reducer for add friend request
 *
 * @param friendshipService a service that use to send the request
 */
export function sendRequestReducer(friendshipService: FriendshipRequestService) {
     return (state: StoreDataInter<FriendshipRequest> = INITIAL_ADD_FRIEND(), action: FriendControlActionRequestAction) => {
        if (action.type !== FriendControlActionsList.ADD_FRIEND)
            return state;
        switch (action.dataInfo.dataStatus) {
            case StoreDataStatus.SENT: {
                // send the request to service
                friendshipService.sendFriendRequest(action.request);
                return {
                    ...state,
                    payload: action.request,
                    dataInfo: {dataStatus: StoreDataStatus.COMPLETE},
                    dataSource: StoreDataSource.WEB_SOCKET
                };
            }
        }
        return state;
    };
}

/***Reducer for receive request form the service */
export function receivedRequestReducer() {
    return (state: StoreDataInter<FriendshipRequest> = INITIAL_RECEIVED_REQUEST(), action: FriendControlActionRequestAction): StoreDataInter<FriendshipRequest> => {
        if (action.type === FriendControlActionsList.RECEIVED_REQUEST)
            return state;

        if (action.type !== FriendControlActionsList.NEW_REQUEST)
            return state;

        switch (action.dataInfo.dataStatus) {
            case StoreDataStatus.COMPLETE: {
                const oldPayLoads: FriendshipRequest[] = state.payloads.slice();
                if (Array.isArray(action.request)) {
                    action.request.forEach((value) => {
                        oldPayLoads.push(value);
                    });
                }else {
                    oldPayLoads.push(action.request);
                }
                return {
                    ...state,
                    payloads: oldPayLoads,
                    dataInfo: action.dataInfo
                };
            }
            case StoreDataStatus.LOADING:
                return {
                    ...state,
                    payloads: [],
                    dataInfo: action.dataInfo
                };
            case StoreDataStatus.ERROR:
                return {
                    ...state,
                    dataInfo: action.dataInfo
                };
        }
    };
}
