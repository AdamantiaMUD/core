import updateAttributes from '../util/update-attributes.js';
import { PlayerLoginEvent } from '../../../lib/players/events/index.js';

import type Effect from '../../../lib/effects/effect.js';
import type Player from '../../../lib/players/player.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';

export const evt: PlayerEventListenerDefinition<void> = {
    name: PlayerLoginEvent.getName(),
    listener:
        (): PlayerEventListener<void> =>
        (player: Player): void => {
            player.socket?.command(
                'sendData',
                'quests',
                player.questTracker.serialize().active
            );

            const effects = player.effects
                .entries()
                .filter((effect: Effect) => !effect.config.hidden)
                .map((effect: Effect) => effect.serialize());

            player.socket?.command('sendData', 'effects', effects);

            updateAttributes(player);
        },
};

export default evt;
