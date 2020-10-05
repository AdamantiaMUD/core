import Player from '../../../lib/players/player';
import updateAttributes from '../util/update-attributes';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';
import {PlayerLoginEvent} from '../../../lib/players/player-events';

export const evt: MudEventListenerDefinition<void> = {
    name: PlayerLoginEvent.getName(),
    listener: (): MudEventListener<void> =>

        /**
         * @listens Player#login
         */
        (player: Player) => {
            player.socket.command('sendData', 'quests', player.questTracker.serialize().active);

            const effects = player.effects
                .entries()
                .filter(effect => !effect.config.hidden)
                .map(effect => effect.serialize());

            player.socket.command('sendData', 'effects', effects);

            updateAttributes(player);
        }
    ,
};

export default evt;
