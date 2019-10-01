import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import Logger from '../../../lib/util/logger';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
export const finishCharacter: InputEventListenerDefinition = {
    event: (state: GameState) => {
        let startingRoomRef = state.config.get('startingRoom');

        if (!startingRoomRef) {
            Logger.warn('No startingRoom defined in adamantia.json. Defaulting to "limbo:r0001".');
            startingRoomRef = 'limbo:r0001';
        }

        return async (
            socket: TransportStream<EventEmitter>,
            args: {account: Account; name: string}
        ) => {
            let player = new Player();

            player.name = args.name;
            player.account = args.account;

            args.account.addCharacter(args.name);
            args.account.save();

            player.room = state.roomManager.getRoom(startingRoomRef);

            await state.playerManager.save(player);

            // reload from manager so events are set
            player = await state.playerManager.loadPlayer(state, player.account, player.name);
            player.socket = socket;

            socket.emit('done', player);
        };
    },
};

export default finishCharacter;
