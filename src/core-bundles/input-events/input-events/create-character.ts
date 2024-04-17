import type { EventEmitter } from 'events';

import type TransportStream from '../../../lib/communication/transport-stream.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type GameStateData from '../../../lib/game-state-data.js';
import { cast } from '../../../lib/util/functions.js';
import { validateCharacterName } from '../../../lib/util/player.js';
import {
    type CreateCharacterPayload,
    CharacterNameCheckEvent,
    CreateCharacterEvent,
} from '../lib/events/index.js';

/**
 * Player creation event
 */
export const evt: StreamEventListenerFactory<CreateCharacterPayload> = {
    name: CreateCharacterEvent.getName(),
    listener:
        (state: GameStateData): StreamEventListener<CreateCharacterPayload> =>
        (
            stream: TransportStream<EventEmitter>,
            { account }: CreateCharacterPayload
        ): void => {
            stream.write('{bold What would you like to name your character?} ');

            stream.socket.once('data', (buf: Buffer) => {
                stream.write('');

                const name = buf.toString().trim();

                try {
                    validateCharacterName(state.config, name);
                } catch (err: unknown) {
                    stream.write(cast<Error>(err).message);

                    stream.dispatch(new CreateCharacterEvent({ account }));

                    return;
                }

                const isTaken = state.playerManager.exists(name.toLowerCase());

                if (isTaken) {
                    stream.write('That name is already taken.');

                    stream.dispatch(new CreateCharacterEvent({ account }));

                    return;
                }

                stream.dispatch(new CharacterNameCheckEvent({ account, name }));
            });
        },
};

export default evt;
