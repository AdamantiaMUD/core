import Player from '../../../lib/players/player';
import updateTargets from '../util/update-targets';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'update-tick',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#updateTick
         */
        return (player: Player) => {
            const effects = player.effects
                .entries()
                .filter(effect => !effect.config.hidden)
                .map(effect => ({
                    name: effect.name,
                    elapsed: effect.elapsed,
                    remaining: effect.remaining,
                    config: {duration: effect.config.duration},
                }));

            if (effects.length) {
                player.socket.command('sendData', 'effects', effects);
            }

            if (!player.combat.isInCombat()) {
                return;
            }

            updateTargets(player);
        };
    },
};

export default evt;
