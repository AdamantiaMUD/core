import Logger from '../../../../lib/common/logger';
import Player from '../../../../lib/players/player';
import MudEvent from '../../../../lib/events/mud-event';
import {UpdateTickEvent} from '../../../../lib/common/events';
import {cast} from '../../../../lib/util/functions';
import {findCarrier} from '../../../../lib/util/items';
import {sayAt} from '../../../../lib/communication/broadcast';

import type BehaviorDefinition from '../../../../lib/behaviors/behavior-definition';
import type GameStateData from '../../../../lib/game-state-data';
import type Item from '../../../../lib/equipment/item';
import type MudEventListener from '../../../../lib/events/mud-event-listener';
import type {UpdateTickPayload} from '../../../../lib/common/events';

export class ItemDecayEvent extends MudEvent<void> {
    public NAME: string = 'item-decay';
}

export const decay: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (): MudEventListener<[Item, UpdateTickPayload]> => (
            item: Item,
            payload: UpdateTickPayload
        ): void => {
            const config = (payload.config ?? {}) as {[key: string]: unknown};

            const now = Date.now();

            let duration: number = cast<number>(config.duration) > 0
                ? cast<number>(config.duration)
                : 60;

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

        [ItemDecayEvent.getName()]: (state: GameStateData): MudEventListener<[Item]> => (item: Item): void => {
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
