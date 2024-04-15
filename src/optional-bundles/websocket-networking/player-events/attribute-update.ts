import updateAttributes from '../util/update-attributes.js';
import {CharacterAttributeUpdateEvent} from '../../../lib/characters/events/index.js';

import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type {CharacterAttributeUpdatePayload} from '../../../lib/characters/events/index.js';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerDefinition<CharacterAttributeUpdatePayload> = {
    name: CharacterAttributeUpdateEvent.getName(),
    listener: (): PlayerEventListener<CharacterAttributeUpdatePayload> => updateAttributes,
};

export default evt;
