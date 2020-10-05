import GameStateData from '../../../lib/game-state-data';
import Player from '../../../lib/players/player';
import {CharacterEquipItemEvent, CharacterEquipItemPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';

export const evt: MudEventListenerDefinition<CharacterEquipItemPayload> = {
    name: CharacterEquipItemEvent.getName(),
    listener: (state: GameState): MudEventListener<CharacterEquipItemPayload> => (player: Player, {slot, item}) => {
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
    },
};

export default evt;
