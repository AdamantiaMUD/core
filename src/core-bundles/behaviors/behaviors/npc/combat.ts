import Item from '../../../../lib/equipment/item.js';
import Logger from '../../../../lib/common/logger.js';
import {
    CharacterDamagedEvent,
    CharacterDeathblowEvent,
    CharacterHitEvent,
} from '../../../../lib/characters/events/index.js';
import {NpcKilledEvent} from '../../../../lib/mobs/events/index.js';
import {UpdateTickEvent} from '../../../../lib/common/events/index.js';
import {makeCorpse} from '../../../../lib/util/combat.js';
import {hasValue, noop} from '../../../../lib/util/functions.js';

import type BehaviorDefinition from '../../../../lib/behaviors/behavior-definition.js';
import type GameStateData from '../../../../lib/game-state-data.js';
import type ItemDefinition from '../../../../lib/equipment/item-definition.js';
import type MudEventListener from '../../../../lib/events/mud-event-listener.js';
import type Npc from '../../../../lib/mobs/npc.js';
import type {
    CharacterDamagedPayload,
    CharacterDeathblowPayload,
    CharacterHitPayload,
} from '../../../../lib/characters/events/index.js';
import type {NpcKilledPayload} from '../../../../lib/mobs/events/index.js';
import type {UpdateTickPayload} from '../../../../lib/common/events/index.js';

/**
 * Example real-time combat behavior for NPCs that goes along with the player's
 * player-combat.js. Have combat implemented in a behavior like this allows two
 * NPCs with this behavior to fight without the player having to be involved.
 */
export const combatListeners: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (state: GameStateData): MudEventListener<[
            Npc,
            UpdateTickPayload,
        ]> => (npc: Npc): void => {
            if (npc.combat.isFighting()) {
                state.combat?.updateRound(state, npc);
            }
        },

        /*
         * NPC was killed
         */
        [NpcKilledEvent.getName()]: (state: GameStateData): MudEventListener<[
            Npc,
            NpcKilledPayload,
        ]> => (npc: Npc): void => {
            if (npc.hasBehavior('lootable')) {
                return;
            }

            const {room, area} = npc;

            if (!hasValue(room)) {
                // @TODO: throw?
                return;
            }

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
        [CharacterHitEvent.getName()]: (): MudEventListener<[Npc, CharacterHitPayload]> => noop,

        [CharacterDamagedEvent.getName()]: (state: GameStateData): MudEventListener<[
            Npc,
            CharacterDamagedPayload,
        ]> => (
            npc: Npc,
            {source}: CharacterDamagedPayload
        ): void => {
            if (npc.getAttribute('hp') <= 0) {
                state.combat?.handleDeath(state, npc, source.attacker);
            }
        },

        /*
         * NPC killed a target
         */
        [CharacterDeathblowEvent.getName()]: (state: GameStateData): MudEventListener<[
            Npc,
            CharacterDeathblowPayload,
        ]> => (npc: Npc): void => {
            if (!npc.combat.isFighting()) {
                state.combat?.startRegeneration(state, npc);
            }
        },
    },
};

export default combatListeners;
