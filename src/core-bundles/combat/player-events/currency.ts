import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';
import {PlayerCurrencyGainedEvent, PlayerCurrencyGainedPayload} from '../../../lib/players/player-events';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: MudEventListenerDefinition<PlayerCurrencyGainedPayload> = {
    name: PlayerCurrencyGainedEvent.getName(),
    listener: (): MudEventListener<PlayerCurrencyGainedPayload> => (player: Player, {denomination, amount}) => {
        const friendlyName = denomination
            .replace('_', ' ')
            .replace(/\b\w/gu, str => str.toUpperCase());

        const key = `currencies.${denomination}`;

        if (!player.getMeta('currencies')) {
            player.setMeta('currencies', {});
        }

        player.setMeta(key, (player.getMeta(key) || 0) + amount);
        player.save();

        /* eslint-disable-next-line max-len */
        sayAt(player, `<green>You receive currency: <b><white>[${friendlyName}]</white></b> x${amount}.`);
    },
};

export default evt;
