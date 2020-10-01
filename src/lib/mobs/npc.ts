import {v4 as uuid} from 'uuid';

import Character from '../characters/character';
import Inventory from '../equipment/inventory';
import Logger from '../util/logger';
import {NpcEnterRoomEvent} from './events';
import {RoomNpcEnterEvent, RoomNpcLeaveEvent} from '../locations/events';
import {hasValue, noop} from '../util/functions';

import type Area from '../locations/area';
import type GameStateData from '../game-state-data';
import type Room from '../locations/room';
import type Serializable from '../data/serializable';
import type SimpleMap from '../util/simple-map';

export interface NpcDefinition {
    attributes?: SimpleMap;
    behaviors?: {[key: string]: SimpleMap};
    corpseDesc?: string;
    defaultEquipment?: {[key: string]: string};
    description: string;
    entityReference?: string;
    id: string;
    items?: string[];
    keywords: string[];
    level: number;
    metadata?: SimpleMap;
    name: string;
    quests?: string[];
    roomDesc?: string;
    script?: string;
    shortName?: string;
    type?: string;
    uuid?: string;
}

export class Npc extends Character implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public area: Area;
    public corpseDesc: string | null;
    public defaultEquipment: {[key: string]: string};
    public defaultItems: string[];
    public description: string;
    public id: string;
    public keywords: string[];
    public quests: string[];
    public roomDesc: string;
    public script: string | null;
    public shortName: string;
    public sourceRoom: Room;
    public uuid: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(area: Area, data: NpcDefinition) {
        super();

        this.area = area;
        this.script = data.script ?? null;
        this.corpseDesc = data.corpseDesc ?? '';
        this.defaultEquipment = data.defaultEquipment ?? {};
        this.defaultItems = data.items ?? [];
        this.description = data.description;
        this.entityReference = data.entityReference ?? null;
        this.id = data.id;
        this.keywords = data.keywords;
        this.name = data.name;
        this.quests = data.quests ?? [];
        this.roomDesc = data.roomDesc ?? '';
        this.shortName = data.shortName ?? '';
        this.uuid = data.uuid ?? uuid();
    }

    // public emit(name: string | symbol, ...args: any[]): boolean {
    //     /*
    //      * Squelch events on a pruned entity. Attempts to prevent the case
    //      * where an entity has been effectively removed from the game but
    //      * somehow still triggered a listener. Set by respective
    //      * EntityManager class
    //      */
    //     if (this.__pruned) {
    //         this.stopListening();
    //
    //         return false;
    //     }
    //
    //     return super.emit(name, ...args);
    // }

    public get inventory(): Inventory {
        if (this._inventory === null) {
            this._inventory = new Inventory();
        }

        return this._inventory;
    }

    public hydrate(state: GameStateData): boolean {
        super.hydrate(state);

        state.mobManager.add(this);

        for (const defaultItemId of this.defaultItems) {
            Logger.verbose(`DIST: Adding item [${defaultItemId}] to npc [${this.name}]`);
            const newItem = state.itemFactory.create(defaultItemId, this.area);

            newItem.hydrate(state);
            state.itemManager.add(newItem);
            this.addItem(newItem);
        }

        for (const [slot, defaultEqId] of Object.entries(this.defaultEquipment)) {
            /* eslint-disable-next-line max-len */
            Logger.verbose(`DIST: Equipping item [${defaultEqId}] to npc [${this.name}] in slot [${slot}]`);

            const newItem = state.itemFactory.create(defaultEqId, this.area);

            newItem.hydrate(state);
            state.itemManager.add(newItem);
            this.equip(newItem, slot);
        }

        return true;
    }

    /**
     * Move the npc to the given room, emitting events appropriately
     *
     * @param {Room} nextRoom
     * @param {function} onMoved Function to run after the npc is moved to the
     *                           next room but before enter events are fired
     * @fires Room#npcLeave
     * @fires Room#npcEnter
     * @fires Npc#enterRoom
     */
    public moveTo(nextRoom: Room, onMoved: () => void = noop): void {
        const prevRoom = this.room;

        if (hasValue(this.room)) {
            /**
             * @event Room#npcLeave
             */
            this.room.dispatch(new RoomNpcLeaveEvent({npc: this, nextRoom: nextRoom}));
            this.room.removeNpc(this);
        }

        this.room = nextRoom;
        nextRoom.addNpc(this);

        onMoved();

        nextRoom.dispatch(new RoomNpcEnterEvent({npc: this, prevRoom: prevRoom}));

        this.dispatch(new NpcEnterRoomEvent({nextRoom}));
    }
}

export default Npc;
