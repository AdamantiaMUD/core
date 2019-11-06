import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import Player from '../../../lib/players/player';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

export interface PlayerConfirmPasswordPayload {
    account: Account;
    nextStage: string;
}

export const PlayerConfirmPasswordEvent: MudEventConstructor<PlayerConfirmPasswordPayload> = class extends MudEvent<PlayerConfirmPasswordPayload> {
    public static NAME: string = 'confirm-password';
    public account: Account;
    public nextStage: string;
};

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
