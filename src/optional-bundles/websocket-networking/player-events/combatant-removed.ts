import Player from '../../../lib/players/player';
import updateTargets from '../util/update-targets';
import {CombatantRemovedEvent, CombatantRemovedPayload} from '../../../lib/combat/combat-events';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';

/* eslint-disable-next-line arrow-body-style */
export const evt: MudEventListenerDefinition<CombatantRemovedPayload> = {
    name: CombatantRemovedEvent.getName(),
    listener: (): MudEventListener<CombatantRemovedPayload> =>

        /**
         * @listens Player#combatantRemoved
         */
        (player: Player) => {
            updateTargets(player);
        }
    ,
};

export default evt;
