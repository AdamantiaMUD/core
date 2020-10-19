import updateTargets from '../util/update-targets';
import {CombatantAddedEvent} from '../../../lib/combat/events';

import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {CombatantAddedPayload} from '../../../lib/combat/events';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerDefinition<CombatantAddedPayload> = {
    name: CombatantAddedEvent.getName(),
    listener: (): PlayerEventListener<CombatantAddedPayload> => updateTargets,
};

export default evt;
