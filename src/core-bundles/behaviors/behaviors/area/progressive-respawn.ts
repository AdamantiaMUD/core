import {Random} from 'rando-js';

import Area from '~/lib/locations/area';
import GameStateData from '~/lib/game-state-data';
import Item from '~/lib/equipment/item';
import Logger from '~/lib/util/logger';
import Npc from '~/lib/mobs/npc';
import Room, {RoomEntityDefinition} from '~/lib/locations/room';
import {AreaRoomAddedEvent, AreaRoomAddedPayload} from '~/lib/locations/area-events';
import {BehaviorDefinition} from '~/lib/behaviors/behavior';
import {MEL} from '~/lib/events/mud-event';
import {RoomRespawnTickEvent, RoomRespawnTickPayload} from '~/lib/locations/room-events';
import {UpdateTickEvent, UpdateTickPayload} from '~/lib/common/common-events';

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
        [UpdateTickEvent.getName()]: (state: GameState): MEL<UpdateTickPayload> => {
            let lastRespawnTick = Date.now();

            return (area: Area, payload: UpdateTickPayload): void => {
                const config = (payload?.config ?? {}) as {[key: string]: unknown};

                // setup respawnTick to only happen every [interval] seconds
                const respawnInterval: number = config?.interval as number ?? 30;
                const sinceLastTick = Date.now() - lastRespawnTick;

                if (sinceLastTick >= respawnInterval * 1000) {
                    lastRespawnTick = Date.now();
                    for (const [, room] of area.rooms) {
                        room.dispatch(new RoomRespawnTickEvent({state}));
                    }
                }
            };
        },

        [AreaRoomAddedEvent.getName()]: (): MEL<AreaRoomAddedPayload> => (
            area: Area,
            {room}: AreaRoomAddedPayload
        ): void => {
            room.listen(
                RoomRespawnTickEvent.getName(),
                /* eslint-disable-next-line id-length */
                (rm: Room, {state}: RoomRespawnTickPayload): void => {
                    rm.resetDoors();

                    rm.defaultNpcs
                        .forEach((entity: RoomEntityDefinition) => {
                            const entityDefinition: RoomEntityDefinition = {
                                maxLoad: 1,
                                replaceOnRespawn: false,
                                respawnChance: 100,
                                ...entity,
                            };

                            const entityCount = [...rm.spawnedNpcs]
                                .filter((npc: Npc) => npc.entityReference === entityDefinition.id)
                                .length;

                            const needsRespawn = entityCount < entityDefinition.maxLoad;

                            if (!needsRespawn) {
                                return;
                            }

                            if (Random.probability(entityDefinition.respawnChance)) {
                                try {
                                    rm.spawnNpc(state, entityDefinition.id);
                                }
                                catch (err) {
                                    Logger.error(err.message);
                                }
                            }
                        });

                    rm.defaultItems
                        .forEach((entity: RoomEntityDefinition) => {
                            const entityDef: RoomEntityDefinition = {
                                maxLoad: 1,
                                replaceOnRespawn: false,
                                respawnChance: 100,
                                ...entity,
                            };

                            const entityCount = [...rm.items]
                                .filter((item: Item) => item.entityReference === entityDef.id)
                                .length;

                            const needsRespawn = entityCount < entityDef.maxLoad;

                            if (!needsRespawn && !entityDef.replaceOnRespawn) {
                                return;
                            }

                            if (Random.probability(entityDef.respawnChance)) {
                                if (entityDef.replaceOnRespawn) {
                                    rm.items.forEach((item: Item) => {
                                        if (item.entityReference === entityDef.id) {
                                            state.itemManager.remove(item);
                                        }
                                    });
                                }

                                rm.spawnItem(state, entityDef.id);
                            }
                        });
                }
            );
        },
    },
};

export default progressiveRespawn;
