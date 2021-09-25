import updateAttributes from '../util/update-attributes';
import {CharacterAttributeUpdateEvent} from '../../../lib/characters/events';

import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {CharacterAttributeUpdatePayload} from '../../../lib/characters/events';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerDefinition<CharacterAttributeUpdatePayload> = {
    name: CharacterAttributeUpdateEvent.getName(),
    listener: (): PlayerEventListener<CharacterAttributeUpdatePayload> => updateAttributes,
};

export default evt;
