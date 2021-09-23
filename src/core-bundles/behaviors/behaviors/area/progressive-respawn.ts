import Logger from '../../../../lib/common/logger';
import {AreaRoomAddedEvent, RoomRespawnTickEvent} from '../../../../lib/locations/events';
import {UpdateTickEvent} from '../../../../lib/common/events';
import {cast, hasValue} from '../../../../lib/util/functions';
import {probability} from '../../../../lib/util/random';

import type Area from '../../../../lib/locations/area';
import type BehaviorDefinition from '../../../../lib/behaviors/behavior-definition';
import type GameStateData from '../../../../lib/game-state-data';
import type Item from '../../../../lib/equipment/item';
import type MudEventListener from '../../../../lib/events/mud-event-listener';
import type Npc from '../../../../lib/mobs/npc';
import type Room from '../../../../lib/locations/room';
import type RoomEntityDefinition from '../../../../lib/locations/room-entity-definition';
import type {AreaRoomAddedPayload, RoomRespawnTickPayload} from '../../../../lib/locations/events';
import type {UpdateTickPayload} from '../../../../lib/common/events';

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
        [UpdateTickEvent.getName()]: (state: GameStateData): MudEventListener<[Area, UpdateTickPayload]> => {
            let lastRespawnTick = Date.now();

            return (area: Area, payload: UpdateTickPayload): void => {
                const config = (payload.config ?? {}) as Record<string, unknown>;

                // setup respawnTick to only happen every [interval] seconds
                const respawnInterval: number = cast<number>(config.interval) > 0
                    ? cast<number>(config.interval)
                    : 30;
                const sinceLastTick = Date.now() - lastRespawnTick;

                if (sinceLastTick >= respawnInterval * 1000) {
                    lastRespawnTick = Date.now();
                    for (const [, room] of area.rooms) {
                        room.dispatch(new RoomRespawnTickEvent({state}));
                    }
                }
            };
        },

        [AreaRoomAddedEvent.getName()]: (): MudEventListener<[Area, AreaRoomAddedPayload]> => (
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

                            const shouldRespawn = entityCount < (entityDefinition.maxLoad ?? 1);

                            if (!shouldRespawn || !hasValue(state)) {
                                return;
                            }

                            if (probability(entityDefinition.respawnChance ?? 0)) {
                                try {
                                    rm.spawnNpc(state, entityDefinition.id);
                                }
                                catch (err: unknown) {
                                    Logger.error(cast<Error>(err).message);
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

                            const shouldRespawn = entityCount < (entityDef.maxLoad ?? 1);

                            if ((!shouldRespawn && !entityDef.replaceOnRespawn) || !hasValue(state)) {
                                return;
                            }

                            if (probability(entityDef.respawnChance ?? 0)) {
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
