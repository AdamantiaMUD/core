import Broadcast from '../../../lib/communication/broadcast.js';
import {PlayerCurrencyGainedEvent} from '../../../lib/players/events/index.js';
import {hasValue} from '../../../lib/util/functions.js';

import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type Player from '../../../lib/players/player.js';
import type {PlayerCurrencyGainedPayload} from '../../../lib/players/events/index.js';

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
