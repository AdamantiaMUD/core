import type {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
import {CharacterNameCheckEvent, CreateCharacterEvent} from '../lib/events';
import {cast} from '../../../lib/util/functions';
import {validateCharacterName} from '../../../lib/util/player';

import type GameStateData from '../../../lib/game-state-data';
import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';
import type {CreateCharacterPayload} from '../lib/events';

/**
 * Player creation event
 */
export const evt: StreamEventListenerFactory<CreateCharacterPayload> = {
    name: CreateCharacterEvent.getName(),
    listener: (state: GameStateData): StreamEventListener<CreateCharacterPayload> => (
        stream: TransportStream<EventEmitter>,
        {account}: CreateCharacterPayload
    ): void => {
        const say = EventUtil.genSay(stream);
        const write = EventUtil.genWrite(stream);

        write('<b>What would you like to name your character?</b> ');

        stream.socket.once('data', (buf: Buffer) => {
            say('');

            const name = buf.toString().trim();

            try {
                validateCharacterName(state.config, name);
            }
            catch (err: unknown) {
                say(cast<Error>(err).message);

                stream.dispatch(new CreateCharacterEvent({account}));

                return;
            }

            const isTaken = state.playerManager.exists(name.toLowerCase());

            if (isTaken) {
                say('That name is already taken.');

                stream.dispatch(new CreateCharacterEvent({account}));

                return;
            }

            stream.dispatch(new CharacterNameCheckEvent({account, name}));
        });
    },
};

export default evt;
