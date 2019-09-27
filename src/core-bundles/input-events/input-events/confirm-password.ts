import {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/**
 * Account password confirmation station
 */
export const confirmPassword: InputEventListenerDefinition = {
    event: () => (socket: TransportStream<EventEmitter>, args: {account: Account; nextStage: string}) => {
        const write = EventUtil.genWrite(socket);
        const say = EventUtil.genSay(socket);

        write('<cyan>Confirm your password:</cyan> ');

        socket.command('toggleEcho');

        socket.once('data', pass => {
            socket.command('toggleEcho');

            if (!args.account.checkPassword(pass.toString().trim())) {
                say('<red>Passwords do not match.</red>');

                socket.emit('change-password', args);

                return;
            }

            // echo was disabled, the user's Enter didn't make a newline
            say('');

            socket.emit(args.nextStage, {account: args.account});
        });
    },
};

export default confirmPassword;
