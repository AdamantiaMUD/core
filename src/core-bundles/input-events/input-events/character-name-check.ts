import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamCreateCharacterEvent} from './create-character';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';
import {StreamFinishCharacterEvent} from './finish-character';

export interface StreamCharacterNameCheckPayload {
    account: Account;
    name: string;
}

export const StreamCharacterNameCheckEvent: StreamEventConstructor<StreamCharacterNameCheckPayload> = class extends StreamEvent<StreamCharacterNameCheckPayload> {
    public NAME: string = 'character-name-check';
    public account: Account;
    public name: string;
};

/**
 * Confirm new player name
 */
export const evt: StreamEventListenerFactory<StreamCharacterNameCheckPayload> = {
    name: new StreamCharacterNameCheckEvent().getName(),
    listener: (): StreamEventListener<StreamCharacterNameCheckPayload> => (
        stream: TransportStream<EventEmitter>,
        args: StreamCharacterNameCheckPayload
    ) => {
        const say = EventUtil.genSay(stream);
        const write = EventUtil.genWrite(stream);

        /* eslint-disable-next-line max-len */
        write(`<b>${args.name} doesn't exist, would you like to create it?</b> <cyan>[y/n]</cyan> `);

        stream.socket.once('data', (buf: Buffer) => {
            say('');

            const confirmation = buf.toString()
                .trim()
                .toLowerCase();

            if (!(/[yn]/u).test(confirmation)) {
                stream.dispatch(new StreamCharacterNameCheckEvent(args));

                return;
            }

            if (confirmation === 'n') {
                say("Let's try again...");

                stream.dispatch(new StreamCreateCharacterEvent({account: args.account}));

                return;
            }

            stream.dispatch(new StreamFinishCharacterEvent(args));
        });
    },
};

export default evt;
