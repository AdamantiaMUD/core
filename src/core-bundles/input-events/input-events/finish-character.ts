import type { EventEmitter } from 'events';

import Player from '../../../lib/players/player.js';
import {
    FinishCharacterEvent,
    LoginCompleteEvent,
} from '../lib/events/index.js';

import type GameStateData from '../../../lib/game-state-data.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type TransportStream from '../../../lib/communication/transport-stream.js';
import type { FinishCharacterPayload } from '../lib/events/index.js';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
export const evt: StreamEventListenerFactory<FinishCharacterPayload> = {
    name: FinishCharacterEvent.getName(),
    listener: (
        state: GameStateData
    ): StreamEventListener<FinishCharacterPayload> => {
        const startingRoomRef = state.config.getStartingRoom();

        return async (
            stream: TransportStream<EventEmitter>,
            args: FinishCharacterPayload
        ): Promise<void> => {
            let player = new Player();

            player.setName(args.name);

            args.account.addCharacter(args.name);
            args.account.save();

            player.setRoom(state.roomManager.getRoom(startingRoomRef));

            await state.playerManager.save(player);

            // reload from manager so events are set
            player = await state.playerManager.loadPlayer(player.name);
            player.socket = stream;

            stream.dispatch(new LoginCompleteEvent({ player }));
        };
    },
};

export default evt;
