import GameStateData from '~/lib/game-state-data';
import Item from '~/lib/equipment/item';
import Logger from '~/lib/util/logger';
import Player from '~/lib/players/player';
import {BehaviorDefinition} from '~/lib/behaviors/behavior';
import {
    MEL,
    MudEvent,
    MudEventConstructor,
} from '~/lib/events/mud-event';
import {UpdateTickEvent, UpdateTickPayload} from '~/lib/common/common-events';
import {findCarrier} from '~/lib/util/items';
import {sayAt} from '~/lib/communication/broadcast';

export class ItemDecayEvent extends MudEvent<void> {
    public NAME: string = 'item-decay';
};

export const decay: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (): MEL<UpdateTickPayload> => (
            item: Item,
            payload: UpdateTickPayload
        ): void => {
            const config = (payload?.config ?? {}) as {[key: string]: unknown};

            const now = Date.now();

            let duration: number = config.duration as number ?? 60;

            duration *= 1000;

            const decaysAt = item.getMeta<number>('decays-at') ?? now + duration;

            item.setMeta('decays-at', decaysAt);

            if (now >= decaysAt) {
                item.dispatch(new ItemDecayEvent());
            }
            else {
                item.setMeta('time-until-decay', decaysAt - now);
            }
        },

        [ItemDecayEvent.getName()]: (state: GameState): MEL<void> => (item: Item): void => {
            const {room} = item;

            const owner = findCarrier(item);

            if (owner !== null && owner instanceof Player) {
                sayAt(owner, `Your ${item.name} has rotted away!`);
            }

            if (room !== null) {
                sayAt(room, `${item.name} has rotted away!`);
            }

            Logger.verbose(`[${item.uuid}] ${item.entityReference} has decayed.`);

            state.itemManager.remove(item);
        },
    },
};

export default decay;
