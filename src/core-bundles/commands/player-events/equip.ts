import {CharacterEquipItemEvent} from '../../../lib/characters/events';
import {hasValue} from '../../../lib/util/functions';

import type GameStateData from '../../../lib/game-state-data';
import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {CharacterEquipItemPayload} from '../../../lib/characters/events';

export const evt: MudEventListenerDefinition<[Player, CharacterEquipItemPayload]> = {
    name: CharacterEquipItemEvent.getName(),
    listener: (state: GameStateData): MudEventListener<[Player, CharacterEquipItemPayload]> => (
        player: Player,
        {slot, item}: CharacterEquipItemPayload
    ): void => {
        if (!hasValue(item.getMeta('stats'))) {
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
    },
};

export default evt;
