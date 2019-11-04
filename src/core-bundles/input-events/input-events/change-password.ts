import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {
    PlayerChangePasswordEvent,
    PlayerChangePasswordPayload,
    PlayerConfirmPasswordEvent,
} from '../../../lib/players/player-events';

/**
 * Change password event
 */
export const evt: MudEventListenerFactory<PlayerChangePasswordPayload> = {
    name: PlayerChangePasswordEvent.getName(),
    listener: (state: GameState): MudEventListener<PlayerChangePasswordPayload> => (
        player: Player,
        args: PlayerChangePasswordPayload
    ) => {
        const say = EventUtil.genSay(player);
        const write = EventUtil.genWrite(player);

        const {account} = args;

        say('Your password must be at least 8 characters.');
        write('<cyan>Enter your account password:</cyan> ');

        player.socket.command('toggleEcho');

        player.socket.once('data', (buf: Buffer) => {
            player.socket.command('toggleEcho');

            say('');

            const pass = buf.toString().trim();

            if (!pass) {
                say('You must use a password.');

                player.dispatch(new PlayerChangePasswordEvent(args));

                return;
            }

            if (pass.length < 8) {
                say('Your password is not long enough.');

                player.dispatch(new PlayerChangePasswordEvent(args));

                return;
            }

            // setPassword handles hashing
            account.setPassword(pass);
            state.accountManager.setAccount(account.username, account);
            account.save();

            player.dispatch(new PlayerConfirmPasswordEvent(args));
        });
    },
};

export default changePassword;
