import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {
    PlayerChangePasswordEvent,
    PlayerConfirmPasswordEvent,
    PlayerConfirmPasswordPayload,
} from '../../../lib/players/player-events';

/**
 * Account password confirmation station
 */
export const evt: MudEventListenerFactory<PlayerConfirmPasswordPayload> = {
    name: PlayerConfirmPasswordEvent.getName(),
    listener: (): MudEventListener<PlayerConfirmPasswordPayload> => (
        player: Player,
        args: PlayerConfirmPasswordPayload
    ) => {
        const write = EventUtil.genWrite(player);
        const say = EventUtil.genSay(player);

        write('<cyan>Confirm your password:</cyan> ');

        player.socket.command('toggleEcho');

        player.socket.once('data', pass => {
            player.socket.command('toggleEcho');

            if (!args.account.checkPassword(pass.toString().trim())) {
                say('<red>Passwords do not match.</red>');

                player.dispatch(new PlayerChangePasswordEvent(args));

                return;
            }

            // echo was disabled, the user's Enter didn't make a newline
            say('');

            socket.emit(args.nextStage, {account: args.account});
        });
    },
};

export default confirmPassword;
