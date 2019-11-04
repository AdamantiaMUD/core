import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import Logger from '../../../lib/util/logger';
import TransportStream from '../../../lib/communication/transport-stream';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
export const evt: MudEventListenerFactory<> = {
export const finishCharacter: InputEventListenerDefinition = {
    event: (state: GameState) => {
        let startingRoomRef = state.config.get('startingRoom');

        if (!startingRoomRef) {
            Logger.warn('No startingRoom defined in adamantia.json. Defaulting to "dragonshade:r0001".');
            startingRoomRef = 'dragonshade:r0001';
        }

        return async (
            socket: TransportStream<EventEmitter>,
            args: {account: Account; name: string}
        ) => {
            let player = new Player();

            player.name = args.name;

            args.account.addCharacter(args.name);
            args.account.save();

            player.room = state.roomManager.getRoom(startingRoomRef);

            await state.playerManager.save(player);

            // reload from manager so events are set
            player = await state.playerManager.loadPlayer(state, player.name);
            player.socket = socket;

            socket.emit('done', player);
        };
    },
};

export default finishCharacter;
