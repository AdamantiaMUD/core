import GameState from '../../../../lib/game-state';
import Item, {ItemDefinition} from '../../../../lib/equipment/item';
import Logger from '../../../../lib/util/logger';
import Npc from '../../../../lib/mobs/npc';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';
import {makeCorpse} from '../../../../lib/util/combat';

/**
 * Example real-time combat behavior for NPCs that goes along with the player's
 * player-combat.js. Have combat implemented in a behavior like this allows two
 * NPCs with this behavior to fight without the player having to be involved.
 */
export const combatListeners: BehaviorDefinition = {
    listeners: {
        updateTick: (state: GameState) => (npc: Npc) => {
            if (npc.combat.isFighting()) {
                state.combat.updateRound(state, npc);
            }
        },

        /**
         * NPC was killed
         */
        killed: (state: GameState) => (npc: Npc) => {
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

        /**
         * NPC hit another character
         */
        hit: () => () => {},

        damaged: (state: GameState) => (npc: Npc, config, damage) => {
            if (npc.getAttribute('hp') <= 0) {
                state.combat.handleDeath(state, npc, damage.attacker);
            }
        },

        /**
         * NPC killed a target
         */
        deathblow: (state: GameState) => (npc: Npc) => {
            if (!npc.combat.isFighting()) {
                state.combat.startRegeneration(state, npc);
            }
        },
    },
};

export default combatListeners;
