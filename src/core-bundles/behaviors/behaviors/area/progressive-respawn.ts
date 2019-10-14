import {Random} from 'rando-js';

import Area from '../../../../lib/locations/area';
import GameState from '../../../../lib/game-state';
import Logger from '../../../../lib/util/logger';
import Room from '../../../../lib/locations/room';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';

const respawnRoom = (room: Room, state: GameState): void => {
    // relock/close doors
    room.doors = new Map(Object.entries(JSON.parse(JSON.stringify(room.defaultDoors || {}))));

    room.defaultNpcs
        .forEach((npc: string | RoomEntityDefinition) => {
            let defaultNpc: RoomEntityDefinition = {id: 'undefined'};

            if (typeof npc === 'string') {
                defaultNpc = {
                    id: npc,
                    maxLoad: 1,
                    replaceOnRespawn: false,
                    respawnChance: 100,
                };
            }
            else {
                defaultNpc = {
                    maxLoad: 1,
                    replaceOnRespawn: false,
                    respawnChance: 100,
                    ...npc,
                };
            }

            const npcCount = [...room.spawnedNpcs]
                .filter(snpc => snpc.entityReference === defaultNpc.id)
                .length;

            const needsRespawn = npcCount < defaultNpc.maxLoad;

            if (!needsRespawn) {
                return;
            }

            if (Random.probability(defaultNpc.respawnChance)) {
                try {
                    room.spawnNpc(state, defaultNpc.id);
                }
                catch (err) {
                    Logger.error(err.message);
                }
            }
        });

    room.defaultItems
        .forEach((item: string | RoomEntityDefinition) => {
            let defaultItem: RoomEntityDefinition = {id: 'undefined'};

            if (typeof item === 'string') {
                defaultItem = {
                    id: item,
                    maxLoad: 1,
                    replaceOnRespawn: false,
                    respawnChance: 100,
                };
            }
            else {
                defaultItem = {
                    maxLoad: 1,
                    replaceOnRespawn: false,
                    respawnChance: 100,
                    ...item,
                };
            }

            const itemCount = [...room.items]
                .filter(itm => itm.entityReference === defaultItem.id)
                .length;

            const needsRespawn = itemCount < defaultItem.maxLoad;

            if (!needsRespawn && !defaultItem.replaceOnRespawn) {
                return;
            }

            if (Random.probability(defaultItem.respawnChance)) {
                if (defaultItem.replaceOnRespawn) {
                    room.items.forEach(itm => {
                        if (itm.entityReference === defaultItem.id) {
                            state.itemManager.remove(itm);
                        }
                    });
                }

                room.spawnItem(state, defaultItem.id);
            }
        });
};

/**
 * Behavior for having a constant respawn tick happening every [interval]
 * seconds. As opposed to one giant full area respawn every 10 minutes this will
 * constantly try to respawn an entity (item/npc) in an area's rooms based on
 * the entity's respawn chance until it hits the entity's maxLoad for the room.
 *
 * config:
 *   interval: number=30
 */
export const behavior: BehaviorDefinition = {
    listeners: {
        updateTick: (state: GameState) => {
            let lastRespawnTick = Date.now();

            return function(area: Area, config) {
                // setup respawnTick to only happen every [interval] seconds
                const respawnInterval = config.interval || 30;
                const sinceLastTick = Date.now() - lastRespawnTick;

                if (sinceLastTick >= respawnInterval * 1000) {
                    lastRespawnTick = Date.now();
                    for (const [, room] of area.rooms) {
                        room.emit('respawnTick', state);
                    }
                }
            };
        },

        roomAdded: () => (area: Area, config, room: Room) => {
            room.on('respawnTick', (state: GameState) => respawnRoom(room, state));
        },
    },
};

export default behavior;
