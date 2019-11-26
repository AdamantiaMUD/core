import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import {CharacterEquipItemEvent, CharacterEquipItemPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

export const evt: MudEventListenerFactory<CharacterEquipItemPayload> = {
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
