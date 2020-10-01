import Broadcast from '../../../lib/communication/broadcast';
import {isNpc} from '../../../lib/util/characters';
import LevelUtil from '../../../lib/util/level-util';
import Player from '../../../lib/players/player';
import {CharacterDeathblowEvent, CharacterDeathblowPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {PlayerExperienceEvent} from '../../../lib/players/player-events';

const {sayAt} = Broadcast;

export const evt: MudEventListenerFactory<CharacterDeathblowPayload> = {
    name: CharacterDeathblowEvent.getName(),
    listener: (): MudEventListener<CharacterDeathblowPayload> => (player: Player, payload: CharacterDeathblowPayload) => {
        const {target, skipParty = false} = payload;

        /* eslint-disable-next-line id-length */
        const xp = LevelUtil.mobExp(target.level);

        if (player.party && !skipParty) {
            /*
             * If they're in a party, proxy the deathblow to all members of
             * the party in the same room. this will make sure party members
             * get quest credit trigger anything else listening for
             * deathblow
             */
            for (const member of player.party) {
                if (member.room === player.room) {
                    member.dispatch(new CharacterDeathblowEvent({skipParty: true, target: target}));
                }
            }

            return;
        }

        if (target && !isNpc(player)) {
            sayAt(player, `<b><red>You killed ${target.name}!</red></b>`);
        }

        player.dispatch(new PlayerExperienceEvent({amount: xp}));
    },
};

export default evt;
