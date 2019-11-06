import Broadcast from '../../../../lib/communication/broadcast';
import GameState from '../../../../lib/game-state';
import Item from '../../../../lib/equipment/item';
import Logger from '../../../../lib/util/logger';
import Player from '../../../../lib/players/player';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';
import {
    MudEvent,
    MudEventConstructor,
    MudEventListener
} from '../../../../lib/events/mud-event';
import {UpdateTickEvent, UpdateTickPayload} from '../../../../lib/common/common-events';
import {findCarrier} from '../../../../lib/util/items';

const {sayAt} = Broadcast;

export const ItemDecayEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public static NAME: string = 'item-decay';
};

export const decay: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (): MudEventListener<UpdateTickPayload> => (item: Item, payload) => {
            const config = payload?.config ?? {};

            const now = Date.now();

            let {duration = 60} = config;

            duration *= 1000;

            let decaysAt = item.getMeta('decays-at');

            decaysAt = decaysAt || now + duration;

            item.setMeta('decays-at', decaysAt);

            if (now >= decaysAt) {
                item.dispatch(new ItemDecayEvent());
            }
            else {
                item.setMeta('time-until-decay', decaysAt - now);
            }
        },

        [ItemDecayEvent.getName()]: (state: GameState): MudEventListener<never> => (item: Item) => {
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
