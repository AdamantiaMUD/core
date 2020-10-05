import Player from '../../../lib/players/player';
import updateAttributes from '../util/update-attributes';
import {CharacterAttributeUpdateEvent, CharacterAttributeUpdatePayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';

/* eslint-disable-next-line arrow-body-style */
export const evt: MudEventListenerDefinition<CharacterAttributeUpdatePayload> = {
    name: CharacterAttributeUpdateEvent.getName(),
    listener: (): MudEventListener<CharacterAttributeUpdatePayload> =>

        /**
         * @listens Player#attributeUpdate
         */
        (player: Player) => {
            updateAttributes(player);
        }
    ,
};

export default evt;
