import updateTargets from '../util/update-targets.js';
import {CombatantRemovedEvent} from '../../../lib/combat/events/index.js';

import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type {CombatantRemovedPayload} from '../../../lib/combat/events/index.js';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerDefinition<CombatantRemovedPayload> = {
    name: CombatantRemovedEvent.getName(),
    listener: (): PlayerEventListener<CombatantRemovedPayload> => updateTargets,
};

export default evt;
