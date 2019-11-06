import {Random} from 'rando-js';

import Area from '../../../../lib/locations/area';
import GameState from '../../../../lib/game-state';
import Logger from '../../../../lib/util/logger';
import Room, {RoomEntityDefinition} from '../../../../lib/locations/room';
import {AreaRoomAddedEvent, AreaRoomAddedPayload} from '../../../../lib/locations/area-events';
import {BehaviorDefinition} from '../../../../lib/behaviors/behavior';
import {MudEventListener} from '../../../../lib/events/mud-event';
import {RoomRespawnTickEvent} from '../../../../lib/locations/room-events';
import {UpdateTickEvent, UpdateTickPayload} from '../../../../lib/common/common-events';

/**
 * Behavior for having a constant respawn tick happening every [interval]
 * seconds. As opposed to one giant full area respawn every 10 minutes this will
 * constantly try to respawn an entity (item/npc) in an area's rooms based on
 * the entity's respawn chance until it hits the entity's maxLoad for the room.
 *
 * config:
 *   interval: number=30
 */
export const progressiveRespawn: BehaviorDefinition = {
    listeners: {
        [UpdateTickEvent.getName()]: (state: GameState): MudEventListener<UpdateTickPayload> => {
            let lastRespawnTick = Date.now();

            return function(area: Area, payload) {
                const config = payload?.config ?? {};

                // setup respawnTick to only happen every [interval] seconds
                const respawnInterval = config?.interval ?? 30;
                const sinceLastTick = Date.now() - lastRespawnTick;

                if (sinceLastTick >= respawnInterval * 1000) {
                    lastRespawnTick = Date.now();
                    for (const [, room] of area.rooms) {
                        room.dispatch(new RoomRespawnTickEvent({state}));
                    }
                }
            };
        },

        [AreaRoomAddedEvent.getName()]: (): MudEventListener<AreaRoomAddedPayload> => (area: Area, {room}) => {
            room.listen(RoomRespawnTickEvent.getName(), (room: Room, {state}): void => {
                room.resetDoors();

                room.defaultNpcs
                    .forEach((entity: RoomEntityDefinition) => {
                        const entityDefinition: RoomEntityDefinition = {
                            maxLoad: 1,
                            replaceOnRespawn: false,
                            respawnChance: 100,
                            ...entity,
                        };

                        const entityCount = [...room.spawnedNpcs]
                            .filter(npc => npc.entityReference === entityDefinition.id)
                            .length;

                        const needsRespawn = entityCount < entityDefinition.maxLoad;

                        if (!needsRespawn) {
                            return;
                        }

                        if (Random.probability(entityDefinition.respawnChance)) {
                            try {
                                room.spawnNpc(state, entityDefinition.id);
                            }
                            catch (err) {
                                Logger.error(err.message);
                            }
                        }
                    });

                room.defaultItems
                    .forEach((entity: RoomEntityDefinition) => {
                        const entityDefinition: RoomEntityDefinition = {
                            maxLoad: 1,
                            replaceOnRespawn: false,
                            respawnChance: 100,
                            ...entity,
                        };

                        const entityCount = [...room.items]
                            .filter(item => item.entityReference === entityDefinition.id)
                            .length;

                        const needsRespawn = entityCount < entityDefinition.maxLoad;

                        if (!needsRespawn && !entityDefinition.replaceOnRespawn) {
                            return;
                        }

                        if (Random.probability(entityDefinition.respawnChance)) {
                            if (entityDefinition.replaceOnRespawn) {
                                room.items.forEach(item => {
                                    if (item.entityReference === entityDefinition.id) {
                                        state.itemManager.remove(item);
                                    }
                                });
                            }

                            room.spawnItem(state, entityDefinition.id);
                        }
                    });
            });
        },
    },
};

export default progressiveRespawn;
