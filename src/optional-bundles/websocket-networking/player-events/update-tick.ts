import {
    type UpdateTickPayload,
    UpdateTickEvent,
} from '../../../lib/common/events/index.js';
import type Effect from '../../../lib/effects/effect.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type Player from '../../../lib/players/player.js';
import updateTargets from '../util/update-targets.js';

export const evt: PlayerEventListenerDefinition<UpdateTickPayload> = {
    name: UpdateTickEvent.getName(),
    listener:
        (): PlayerEventListener<UpdateTickPayload> =>
        (player: Player): void => {
            const effects = player.effects
                .entries()
                .filter((effect: Effect) => !effect.config.hidden)
                .map((effect: Effect) => ({
                    name: effect.name,
                    elapsed: effect.elapsed,
                    remaining: effect.remaining,
                    config: { duration: effect.config.duration },
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
