import {Random} from 'rando-js';

import Broadcast from '../../../../lib/communication/broadcast';
import GameState from '../../../../lib/game-state';
import Logger from '../../../../lib/util/logger';
import Npc from '../../../../lib/mobs/npc';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';
import {MudEventListener} from '../../../../lib/events/mud-event';
import {UpdateTickEvent, UpdateTickPayload} from '../../../../lib/common/common-events';

const {sayAt} = Broadcast;

interface WanderConfig {
    areaRestricted: boolean;
    interval: number;
    restrictTo: string[];
}

const defaultWanderConfig = {
    areaRestricted: false,
    interval: 20,
    restrictTo: [],
};

/**
 * An example behavior that causes an NPC to wander around an area when not in combat
 * Options:
 *   areaRestricted: boolean, true to restrict the NPC's wandering to his home area. Default: false
 *   restrictTo: Array<EntityReference>, list of room entity references to restrict the NPC to. For
 *     example if you want them to wander along a set path
 *   interval: number, delay in seconds between room movements. Default: 20
 */
export const wander: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (state: GameState): MudEventListener<UpdateTickPayload> => (npc: Npc, payload) => {
            if (npc.combat.isFighting() || !npc.room) {
                return;
            }

            const cfg = payload?.config ?? defaultWanderConfig;

            let config: WanderConfig = null;

            if (cfg === true) {
                config = defaultWanderConfig;
            }
            else {
                config = {...defaultWanderConfig, ...cfg};
            }

            if (!npc.getMeta('lastWanderTime')) {
                npc.setMeta('lastWanderTime', Date.now());
            }

            if (Date.now() - npc.getMeta('lastWanderTime') < config.interval * 1000) {
                return;
            }

            npc.setMeta('lastWanderTime', Date.now());

            const exits = npc.room.getExits();

            if (!exits.length) {
                return;
            }

            const roomExit = Random.fromArray(exits);
            const randomRoom = state.roomManager.getRoom(roomExit.roomId);

            const door = randomRoom
                && (npc.room.getDoor(randomRoom) || randomRoom.getDoor(npc.room));

            if (door && (door.locked || door.closed)) {
                /*
                 * maybe a possible feature where it could be configured that they can open doors
                 * or even if they have the key they can unlock the doors
                 */
                Logger.verbose(`NPC [${npc.uuid}] wander blocked by door.`);

                return;
            }

            if (
                !randomRoom
                || (config.restrictTo && !config.restrictTo.includes(randomRoom.entityReference))
                || (config.areaRestricted && randomRoom.area !== npc.area)
            ) {
                return;
            }

            /* eslint-disable-next-line max-len */
            Logger.verbose(`NPC [${npc.uuid}] wandering from ${npc.room.entityReference} to ${randomRoom.entityReference}.`);
            sayAt(npc.room, `${npc.name} wanders ${roomExit.direction}.`);
            npc.moveTo(randomRoom);
        },
    },
};

export default wander;
