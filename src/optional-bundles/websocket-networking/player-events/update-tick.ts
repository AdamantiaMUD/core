import Player from '../../../lib/players/player';
import updateTargets from '../util/update-targets';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';
import {UpdateTickEvent, UpdateTickPayload} from '../../../lib/common/common-events';

export const evt: MudEventListenerDefinition<UpdateTickPayload> = {
    name: UpdateTickEvent.getName(),
    listener: (): MudEventListener<UpdateTickPayload> =>

        /**
         * @listens Player#updateTick
         */
        (player: Player) => {
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

            if (!player.combat.isFighting()) {
                return;
            }

            updateTargets(player);
        }
    ,
};

export default evt;
