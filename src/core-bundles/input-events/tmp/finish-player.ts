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
export const finishPlayer: InputEventListenerDefinition = {
    event: (state: GameState) => {
        const startingRoomRef = state.config.get('startingRoom');

        if (!startingRoomRef) {
            Logger.error('No startingRoom defined in ranvier.json');
        }

        return async (
            socket: TransportStream<EventEmitter>,
            args: {account: Account; name: string; classChoice: string}
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

export default finishPlayer;
