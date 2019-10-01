import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/**
 * Confirm new player name
 */
export const characterNameCheck: InputEventListenerDefinition = {
    event: () => (
        socket: TransportStream<EventEmitter>,
        args: {account: Account; name: string}
    ) => {
        const say = EventUtil.genSay(socket);
        const write = EventUtil.genWrite(socket);

        /* eslint-disable-next-line max-len */
        write(`<b>${args.name} doesn't exist, would you like to create it?</b> <cyan>[y/n]</cyan> `);

        socket.once('data', (buf: Buffer) => {
            say('');

            const confirmation = buf.toString()
                .trim()
                .toLowerCase();

            if (!(/[yn]/u).test(confirmation)) {
                socket.emit('character-name-check', args);

                return;
            }

            if (confirmation === 'n') {
                say("Let's try again...");

                socket.emit('create-character', args.account);

                return;
            }

            socket.emit('finish-character', args);
        });
    },
};

export default characterNameCheck;
