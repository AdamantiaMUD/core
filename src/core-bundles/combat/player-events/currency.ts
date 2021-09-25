import Broadcast from '../../../lib/communication/broadcast';
import {PlayerCurrencyGainedEvent} from '../../../lib/players/events';
import {hasValue} from '../../../lib/util/functions';

import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {PlayerCurrencyGainedPayload} from '../../../lib/players/events';

const {sayAt} = Broadcast;

export const evt: MudEventListenerDefinition<[Player, PlayerCurrencyGainedPayload]> = {
    name: PlayerCurrencyGainedEvent.getName(),
    listener: (): MudEventListener<[Player, PlayerCurrencyGainedPayload]> => (
        player: Player,
        {denomination, amount}: PlayerCurrencyGainedPayload
    ): void => {
        const friendlyName = denomination
            .replace('_', ' ')
            .replace(/\b\w/gu, (str: string) => str.toUpperCase());

        const key = `currencies.${denomination}`;

        if (!hasValue(player.getMeta('currencies'))) {
            player.setMeta('currencies', {});
        }

        player.setMeta(key, (player.getMeta<number>(key) ?? 0) + amount);
        player.save();

        sayAt(player, `{green You receive currency:} {white.bold [${friendlyName}]} x${amount}.`);
    },
};

export default evt;
