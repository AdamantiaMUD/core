import Player from '../../../lib/players/player';
import updateTargets from '../util/update-targets';
import {CombatantAddedEvent, CombatantAddedPayload} from '../../../lib/combat/combat-events';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';

/* eslint-disable-next-line arrow-body-style */
export const evt: MudEventListenerDefinition<CombatantAddedPayload> = {
    name: CombatantAddedEvent.getName(),
    listener: (): MudEventListener<CombatantAddedPayload> =>

        /**
         * @listens Player#combatantAdded
         */
        (player: Player) => {
            updateTargets(player);
        }
    ,
};

export default evt;
