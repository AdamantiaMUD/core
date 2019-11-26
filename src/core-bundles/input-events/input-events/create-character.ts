import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamCharacterNameCheckEvent} from './character-name-check';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';
import {validateCharacterName} from '../../../lib/util/player';

export interface StreamCreateCharacterPayload {
    account: Account;
}

export const StreamCreateCharacterEvent: StreamEventConstructor<StreamCreateCharacterPayload> = class extends StreamEvent<StreamCreateCharacterPayload> {
    public NAME: string = 'create-character';
    public account: Account;
};

/**
 * Player creation event
 */
export const evt: StreamEventListenerFactory<StreamCreateCharacterPayload> = {
    name: StreamCreateCharacterEvent.getName(),
    listener: (state: GameState): StreamEventListener<StreamCreateCharacterPayload> => (stream: TransportStream<EventEmitter>, {account}) => {
        const say = EventUtil.genSay(stream);
        const write = EventUtil.genWrite(stream);

        write('<b>What would you like to name your character?</b> ');

        stream.socket.once('data', (buf: Buffer) => {
            say('');

            const name = buf.toString().trim();

            try {
                validateCharacterName(state.config, name);
            }
            catch (err) {
                say(err.message);

                stream.dispatch(new StreamCreateCharacterEvent({account}));

                return;
            }

            const exists = state.playerManager.exists(name.toLowerCase());

            if (exists) {
                say('That name is already taken.');

                stream.dispatch(new StreamCreateCharacterEvent({account}));

                return;
            }

            stream.dispatch(new StreamCharacterNameCheckEvent({account, name}));
        });
    },
};

export default evt;
