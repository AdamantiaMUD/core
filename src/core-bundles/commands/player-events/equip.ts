import {CharacterEquipItemEvent} from '../../../lib/characters/events/index.js';
import {hasValue} from '../../../lib/util/functions.js';

import type GameStateData from '../../../lib/game-state-data.js';
import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type Player from '../../../lib/players/player.js';
import type {CharacterEquipItemPayload} from '../../../lib/characters/events/index.js';

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
