import {CharacterEffectRemovedEvent} from '../../../lib/characters/events';

import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {CharacterEffectRemovedPayload} from '../../../lib/characters/events';

export const evt: PlayerEventListenerDefinition<CharacterEffectRemovedPayload> = {
    name: CharacterEffectRemovedEvent.getName(),
    listener: (): PlayerEventListener<CharacterEffectRemovedPayload> => (player: Player): void => {
        if (player.effects.size === 0) {
            player.socket?.command('sendData', 'effects', []);
        }
    },
};

export default evt;
