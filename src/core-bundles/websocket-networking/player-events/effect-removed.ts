import Player from '../../../lib/players/player';
import {CharacterEffectRemovedEvent, CharacterEffectRemovedPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

export const evt: MudEventListenerFactory<CharacterEffectRemovedPayload> = {
    name: CharacterEffectRemovedEvent.getName(),
    listener: (): MudEventListener<CharacterEffectRemovedPayload> => {
        /**
         * @listens Player#effectRemoved
         */
        return (player: Player) => {
            if (!player.effects.size) {
                player.socket.command('sendData', 'effects', []);
            }
        };
    },
};

export default evt;
