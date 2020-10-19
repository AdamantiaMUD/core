import {hasValue} from '../util/functions';

import type Npc from './npc';

/**
 * Keeps track of all the individual mobs in the game
 */
export class MobManager {
    private readonly _mobs: Map<string, Npc> = new Map<string, Npc>();

    public add(mob: Npc): void {
        this._mobs.set(mob.uuid, mob);
    }

    /**
     * Completely obliterate a mob from the game, nuclear option
     */
    public remove(mob: Npc): void {
        mob.effects.clear();

        const room = mob.room;

        if (hasValue(room)) {
            room.area.removeNpc(mob);
            room.removeNpc(mob, true);
        }

        mob.setPruned();
        mob.stopListening();
        this._mobs.delete(mob.uuid);
    }
}

export default MobManager;
