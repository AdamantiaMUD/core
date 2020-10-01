import {Random} from 'rando-js';

import GameStateData from '~/lib/game-state-data';
import Logger from '~/lib/util/logger';
import Npc from '~/lib/mobs/npc';
import {BehaviorDefinition} from '~/lib/behaviors/behavior';
import Room, {Door} from '~/lib/locations/room';
import {MEL} from '~/lib/events/mud-event';
import {UpdateTickEvent, UpdateTickPayload} from '~/lib/common/common-events';
import {sayAt} from '~/lib/communication/broadcast';

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

const getConfig = (config: true | {[key: string]: unknown}): WanderConfig => {
    if (config === true) {
        return defaultWanderConfig;
    }

    return {...defaultWanderConfig, ...config};
};

const getDoor = (npc: Npc, room: Room): Door => {
    if (room === undefined) {
        return undefined;
    }

    if (npc.room.hasDoor(room)) {
        return npc.room.getDoor(room);
    }

    if (room.hasDoor(npc.room)) {
        return room.getDoor(npc.room);
    }

    return undefined;
};

/**
 * An example behavior that causes an NPC to wander around an area when not in combat
 * Options:
 *   areaRestricted: boolean, true to restrict the NPCs wandering to his home area. Default: false
 *   restrictTo: Array<EntityReference>, list of room entity references to restrict the NPC to. For
 *     example if you want them to wander along a set path
 *   interval: number, delay in seconds between room movements. Default: 20
 */
export const wander: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (state: GameState): MEL<UpdateTickPayload> => (
            npc: Npc,
            payload: UpdateTickPayload
        ): void => {
            if (npc.combat.isFighting() || npc.room === null) {
                return;
            }

            const config: WanderConfig = getConfig(payload.config ?? defaultWanderConfig);

            const lastWanderTime = npc.getMeta<number>('lastWanderTime');

            if (lastWanderTime === undefined) {
                npc.setMeta('lastWanderTime', Date.now());
            }

            if (Date.now() - lastWanderTime < config.interval * 1000) {
                return;
            }

            npc.setMeta('lastWanderTime', Date.now());

            const exits = npc.room.getExits();

            if (exits.length === 0) {
                return;
            }

            const roomExit = Random.fromArray(exits);
            const randomRoom = state.roomManager.getRoom(roomExit.roomId);
            const door: Door = getDoor(npc, randomRoom);

            if (door?.locked || door?.closed) {
                /*
                 * maybe a possible feature where it could be configured that they can open doors
                 * or even if they have the key they can unlock the doors
                 */
                Logger.verbose(`NPC [${npc.uuid}] wander blocked by door.`);

                return;
            }

            if (
                randomRoom === undefined
                || !config.restrictTo?.includes(randomRoom.entityReference)
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
