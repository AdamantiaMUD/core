import GameState from '~/lib/game-state';
import Item, {ItemDefinition} from '~/lib/equipment/item';
import Logger from '~/lib/util/logger';
import Npc from '~/lib/mobs/npc';
import {BehaviorDefinition} from '~/lib/behaviors/behavior';
import {
    CharacterDamagedEvent,
    CharacterDamagedPayload,
    CharacterDeathblowEvent,
    CharacterDeathblowPayload,
    CharacterHitEvent,
    CharacterHitPayload,
} from '~/lib/characters/character-events';
import {MEL} from '~/lib/events/mud-event';
import {NpcKilledEvent, NpcKilledPayload} from '~/lib/mobs/npc-events';
import {UpdateTickEvent, UpdateTickPayload} from '~/lib/common/common-events';
import {makeCorpse} from '~/lib/util/combat';

/**
 * Example real-time combat behavior for NPCs that goes along with the player's
 * player-combat.js. Have combat implemented in a behavior like this allows two
 * NPCs with this behavior to fight without the player having to be involved.
 */
export const combatListeners: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (state: GameState): MEL<UpdateTickPayload> => (npc: Npc): void => {
            if (npc.combat.isFighting()) {
                state.combat.updateRound(state, npc);
            }
        },

        /*
         * NPC was killed
         */
        [NpcKilledEvent.getName()]: (state: GameState): MEL<NpcKilledPayload> => (npc: Npc): void => {
            if (npc.hasBehavior('lootable')) {
                return;
            }

            const {room, area} = npc;

            const corpseDef: ItemDefinition = makeCorpse(npc);

            const corpse = new Item(corpseDef, area);

            corpse.hydrate(state);
            state.itemManager.add(corpse);
            room.addItem(corpse);

            Logger.log(`Generated corpse: ${corpse.uuid}`);
        },

        /*
         * NPC hit another character
         */
        [CharacterHitEvent.getName()]: (): MEL<CharacterHitPayload> => (): void => {},

        [CharacterDamagedEvent.getName()]: (state: GameState): MEL<CharacterDamagedPayload> => (
            npc: Npc,
            {source}: CharacterDamagedPayload
        ): void => {
            if (npc.getAttribute('hp') <= 0) {
                state.combat.handleDeath(state, npc, source.attacker);
            }
        },

        /*
         * NPC killed a target
         */
        [CharacterDeathblowEvent.getName()]: (state: GameState): MEL<CharacterDeathblowPayload> => (npc: Npc): void => {
            if (!npc.combat.isFighting()) {
                state.combat.startRegeneration(state, npc);
            }
        },
    },
};

export default combatListeners;
