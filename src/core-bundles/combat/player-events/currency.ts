import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'currency',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#currency
         */
        return (player: Player, currency: string, amount: number) => {
            const friendlyName = currency
                .replace('_', ' ')
                .replace(/\b\w/gu, str => str.toUpperCase());

            const key = `currencies.${currency}`;

            if (!player.getMeta('currencies')) {
                player.setMeta('currencies', {});
            }

            player.setMeta(key, (player.getMeta(key) || 0) + amount);
            player.save();

            /* eslint-disable-next-line max-len */
            sayAt(player, `<green>You receive currency: <b><white>[${friendlyName}]</white></b> x${amount}.`);
        };
    },
};

export default evt;
