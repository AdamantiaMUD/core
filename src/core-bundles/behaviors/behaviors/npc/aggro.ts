import Broadcast from '../../../../lib/communication/broadcast';
import Logger from '../../../../lib/util/logger';
import Npc from '../../../../lib/mobs/npc';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';

const {sayAt} = Broadcast;

interface AggroConfig {
    delay: number;
    warnMessage: string;
    attackMessage: string;
    towards: {
        players: boolean;
        npcs: boolean | string[];
    };
}

const defaultAggroConfig = {
    delay: 5,
    warnMessage: '%name% growls, warning you away.',
    attackMessage: '%name% attacks you!',
    towards: {
        players: true,
        npcs: [],
    },
};

/**
 * A simple behavior to make an NPC aggressive. Aggressive is defined as attacking after some delay
 * when a player or NPC enters the room. An aggressive NPC will only fixate their attention on one
 * target at a time and not when they're already distracted by combat.
 * Options:
 *   delay: number, seconds after a character enters the room before attacking. Default: 5
 *   warnMessage: string, Message to send to players warning them that the mob will attack soon.
 *     Message supports `%name%` token to place NPC name in message. Message is sent when half of
 *     the delay has passed.
 *     Default '%name% growls, warning you away.'
 *   attackMessage: string, Message to send to players when the mob moves to attack.
 *     Message supports `%name%` token to place NPC name in message.
 *     Default '%name% attacks you!'
 *   towards:
 *     players: boolean, whether the NPC is aggressive towards players. Default: true
 *     npcs: Array<EntityReference>, list of NPC entityReferences which this NPC will attack on sight
 *
 * Example:
 *
 *     # an NPC that's aggressive towards players
 *     behaviors:
 *       aggro:
 *         delay: 10
 *         warnMessage: '%name% snarls angrily.'
 *         towards:
 *           players: true
 *           npcs: false
 *
 *     # an NPC that fights enemy NPC squirrels and rabbits
 *     behaviors:
 *       aggro:
 *          towards:
 *            players: false
 *            npcs: ["limbo:squirrel", "limbo:rabbit"]
 */
export const aggro: BehaviorDefinition = {
    listeners: {
        updateTick: () => (npc: Npc, cfg: AggroConfig) => {
            if (!npc.room) {
                return;
            }

            // setup default configs
            const config = {...defaultAggroConfig, ...cfg};

            if (npc.combat.isInCombat()) {
                return;
            }

            const aggroTarget = npc.getMeta('aggroTarget');

            if (aggroTarget) {
                if (aggroTarget.room !== npc.room) {
                    npc.setMeta('aggroTarget', null);
                    npc.setMeta('aggroWarned', false);

                    return;
                }

                const sinceLastCheck = Date.now() - Number(npc.getMeta('aggroTimer'));
                const delayLength = config.delay * 1000;

                // attack
                if (sinceLastCheck >= delayLength) {
                    if (aggroTarget.isNpc) {
                        /* eslint-disable-next-line max-len */
                        Logger.verbose(`NPC [${npc.uuid}/${npc.entityReference}] attacks NPC [${aggroTarget.uuid}/${aggroTarget.entityReference}] in room ${npc.room.entityReference}.`);
                    }
                    else {
                        sayAt(aggroTarget, config.attackMessage.replace(/%name%/u, npc.name));
                    }

                    npc.combat.initiate(aggroTarget);

                    npc.setMeta('aggroTarget', null);
                    npc.setMeta('aggroWarned', false);

                    return;
                }

                // warn
                if (
                    sinceLastCheck >= delayLength / 2
                    && !aggroTarget.isNpc
                    && !npc.getMeta('aggroWarned')
                ) {
                    sayAt(aggroTarget, config.warnMessage.replace(/%name%/u, npc.name));
                    npc.setMeta('aggroWarned', true);
                }

                return;
            }

            // try to find a player to be aggressive towards first
            if (config.towards.players && npc.room.players.size) {
                npc.setMeta('aggroTarget', [...npc.room.players][0]);
                npc.setMeta('aggroTimer', Date.now());

                return;
            }

            if (config.towards.npcs && npc.room.npcs.size) {
                for (const roomNpc of npc.room.npcs) {
                    if (roomNpc !== npc) {
                        if (
                            config.towards.npcs === true
                            || (
                                Array.isArray(config.towards.npcs)
                                && config.towards.npcs.includes(roomNpc.entityReference)
                            )
                        ) {
                            npc.setMeta('aggroTarget', roomNpc);
                            npc.setMeta('aggroTimer', Date.now());

                            return;
                        }
                    }
                }
            }
        },
    },
};

export default aggro;
