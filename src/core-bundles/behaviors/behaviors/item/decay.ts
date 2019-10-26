import Broadcast from '../../../../lib/communication/broadcast';
import GameState from '../../../../lib/game-state';
import Item from '../../../../lib/equipment/item';
import Logger from '../../../../lib/util/logger';
import Player from '../../../../lib/players/player';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';
import {findCarrier} from '../../../../lib/util/items';

const {sayAt} = Broadcast;

export const decay: BehaviorDefinition = {
    listeners: {
        'update-tick': () => (item: Item, config) => {
            const now = Date.now();

            let {duration = 60} = config;

            duration *= 1000;

            let decaysAt = item.getMeta('decays-at');

            decaysAt = decaysAt || now + duration;

            item.setMeta('decays-at', decaysAt);

            if (now >= decaysAt) {
                item.emit('decay');
            }
            else {
                item.setMeta('time-until-decay', decaysAt - now);
            }
        },

        'decay': (state: GameState) => (item: Item) => {
            const {room} = item;

            const owner = findCarrier(item);

            if (owner && owner instanceof Player) {
                sayAt(owner, `Your ${item.name} has rotted away!`);
            }

            if (room) {
                sayAt(room, `${item.name} has rotted away!`);
            }

            Logger.verbose(`[${item.uuid}] ${item.entityReference} has decayed.`);

            state.itemManager.remove(item);
        },
    },
};

export default decay;
