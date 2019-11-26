import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import Logger from '../../../lib/util/logger';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamDoneEvent} from './done';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

export interface StreamFinishCharacterPayload {
    account: Account;
    name: string;
}

export const StreamFinishCharacterEvent: StreamEventConstructor<StreamFinishCharacterPayload> = class extends StreamEvent<StreamFinishCharacterPayload> {
    public NAME: string = 'stream-finish-character';
    public account: Account;
    public name: string;
};

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
export const evt: StreamEventListenerFactory<StreamFinishCharacterPayload> = {
    name: StreamFinishCharacterEvent.getName(),
    listener: (state: GameState): StreamEventListener<StreamFinishCharacterPayload> => {
        let startingRoomRef = state.config.get('startingRoom');

        if (!startingRoomRef) {
            Logger.warn('No startingRoom defined in adamantia.json. Defaulting to "dragonshade:r0001".');
            startingRoomRef = 'dragonshade:r0001';
        }

        return async (
            stream: TransportStream<EventEmitter>,
            args: StreamFinishCharacterPayload
        ) => {
            let player = new Player();

            player.name = args.name;

            args.account.addCharacter(args.name);
            args.account.save();

            player.room = state.roomManager.getRoom(startingRoomRef);

            await state.playerManager.save(player);

            // reload from manager so events are set
            player = await state.playerManager.loadPlayer(state, player.name);
            player.socket = stream;

            stream.dispatch(new StreamDoneEvent({player}));
        };
    },
};

export default evt;
