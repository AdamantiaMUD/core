import updateTargets from '../util/update-targets';
import {CombatantRemovedEvent} from '../../../lib/combat/events';

import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {CombatantRemovedPayload} from '../../../lib/combat/events';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerDefinition<CombatantRemovedPayload> = {
    name: CombatantRemovedEvent.getName(),
    listener: (): PlayerEventListener<CombatantRemovedPayload> => updateTargets,
};

export default evt;
