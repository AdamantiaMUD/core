import Player from '../../../lib/players/player';
import {CharacterEffectRemovedEvent, CharacterEffectRemovedPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';

export const evt: MudEventListenerDefinition<CharacterEffectRemovedPayload> = {
    name: CharacterEffectRemovedEvent.getName(),
    listener: (): MudEventListener<CharacterEffectRemovedPayload> =>

        /**
         * @listens Player#effectRemoved
         */
        (player: Player) => {
            if (!player.effects.size) {
                player.socket.command('sendData', 'effects', []);
            }
        }
    ,
};

export default evt;
