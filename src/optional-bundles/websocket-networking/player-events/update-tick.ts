import updateTargets from '../util/update-targets';
import {UpdateTickEvent} from '../../../lib/common/events';

import type Effect from '../../../lib/effects/effect';
import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {UpdateTickPayload} from '../../../lib/common/events';

export const evt: PlayerEventListenerDefinition<UpdateTickPayload> = {
    name: UpdateTickEvent.getName(),
    listener: (): PlayerEventListener<UpdateTickPayload> => (player: Player): void => {
        const effects = player.effects
            .entries()
            .filter((effect: Effect) => !effect.config.hidden)
            .map((effect: Effect) => ({
                name: effect.name,
                elapsed: effect.elapsed,
                remaining: effect.remaining,
                config: {duration: effect.config.duration},
            }));

        if (effects.length > 0) {
            player.socket?.command('sendData', 'effects', effects);
        }

        if (!player.combat.isFighting()) {
            return;
        }

        updateTargets(player);
    },
};

export default evt;
