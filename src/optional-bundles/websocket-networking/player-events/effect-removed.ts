import { CharacterEffectRemovedEvent } from '../../../lib/characters/events/index.js';

import type Player from '../../../lib/players/player.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type { CharacterEffectRemovedPayload } from '../../../lib/characters/events/index.js';

export const evt: PlayerEventListenerDefinition<CharacterEffectRemovedPayload> =
    {
        name: CharacterEffectRemovedEvent.getName(),
        listener:
            (): PlayerEventListener<CharacterEffectRemovedPayload> =>
            (player: Player): void => {
                if (player.effects.size === 0) {
                    player.socket?.command('sendData', 'effects', []);
                }
            },
    };

export default evt;
