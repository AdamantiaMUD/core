import {
    type CombatantAddedPayload,
    CombatantAddedEvent,
} from '../../../lib/combat/events/index.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import updateTargets from '../util/update-targets.js';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerDefinition<CombatantAddedPayload> = {
    name: CombatantAddedEvent.getName(),
    listener: (): PlayerEventListener<CombatantAddedPayload> => updateTargets,
};

export default evt;
