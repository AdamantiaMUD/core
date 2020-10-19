import type {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
import {ChangePasswordEvent, ConfirmPasswordEvent} from '../lib/events';

import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';
import type {ConfirmPasswordPayload} from '../lib/events';

/**
 * Account password confirmation station
 */
export const evt: StreamEventListenerFactory<ConfirmPasswordPayload> = {
    name: ConfirmPasswordEvent.getName(),
    listener: (): StreamEventListener<ConfirmPasswordPayload> => (
        stream: TransportStream<EventEmitter>,
        args: ConfirmPasswordPayload
    ): void => {
        const write = EventUtil.genWrite(stream);
        const say = EventUtil.genSay(stream);

        write('<cyan>Confirm your password:</cyan> ');

        stream.command('toggleEcho');

        stream.socket.once('data', (buf: Buffer) => {
            const pass = buf.toString('utf8').trim();

            stream.command('toggleEcho');

            if (!args.account.checkPassword(pass)) {
                say('<red>Passwords do not match.</red>');

                stream.dispatch(new ChangePasswordEvent(args));

                return;
            }

            // echo was disabled, the user's Enter didn't make a newline
            say('');

            stream.dispatch(args.nextEvent);
        });
    },
};

export default evt;
