import {
    type CharacterAttributeUpdatePayload,
    CharacterAttributeUpdateEvent,
} from '../../../lib/characters/events/index.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import updateAttributes from '../util/update-attributes.js';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerDefinition<CharacterAttributeUpdatePayload> =
    {
        name: CharacterAttributeUpdateEvent.getName(),
        listener: (): PlayerEventListener<CharacterAttributeUpdatePayload> =>
            updateAttributes,
    };

export default evt;
