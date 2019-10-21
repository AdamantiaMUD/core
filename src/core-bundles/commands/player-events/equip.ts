import GameState from '../../../lib/game-state';
import Item from '../../../lib/equipment/item';
import Player from '../../../lib/players/player';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

export const evt: PlayerEventListenerFactory = {
    name: 'equip',
    listener: (state: GameState): PlayerEventListener => {
        /**
         * @listens Player#equip
         */
        return (player: Player, slot: string, item: Item) => {
            if (!item.getMeta('stats')) {
                return;
            }

            const stats = item.getMeta('stats');

            const config = {
                name: `Equip: ${slot}`,
                type: `equip.${slot}`,
            };

            const effectState = {slot, stats};

            player.addEffect(state.effectFactory.create(
                'equip',
                config,
                effectState
            ));
        };
    },
};

export default evt;
