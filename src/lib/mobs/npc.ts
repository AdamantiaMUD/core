import uuid from 'uuid/v4';
import {sprintf} from 'sprintf-js';

import Area from '../locations/area';
import BehaviorManager from '../behaviors/behavior-manager';
import Character from '../entities/character';
import GameState from '../game-state';
import Logger from '../util/logger';
import Room from '../locations/room';
import Serializable from '../data/serializable';
import {Scriptable} from '../entities/scriptable-entity';
import {SimpleMap} from '../../../index';
import {noop} from '../util/functions';

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

export class Npc extends Character implements Scriptable, Serializable {
    private _behaviors: Map<string, SimpleMap | true> = new Map();

    public area: Area;
    public corpseDesc: string;
    public defaultEquipment: {[key: string]: string};
    public defaultItems: string[];
    public description: string;
    public id: string;
    public keywords: string[];
    public quests: string[];
    public roomDesc: string;
    public script: string;
    public shortName: string;
    public sourceRoom: Room;
    public uuid: string;
    /* eslint-enable lines-between-class-members */

    public constructor(area, data: NpcDefinition) {
        super();

        const validate = ['keywords', 'name', 'id'];

        for (const prop of validate) {
            if (!(prop in data)) {
                /* eslint-disable-next-line max-len */
                throw new ReferenceError(`NPC in area [${area.name}] missing required property [${prop}]`);
            }
        }

        this.area = area;
        this.script = data.script;
        this.corpseDesc = data.corpseDesc || '';
        this.defaultEquipment = data.defaultEquipment || {};
        this.defaultItems = data.items || [];
        this.description = data.description;
        this.entityReference = data.entityReference;
        this.id = data.id;
        this.keywords = data.keywords;
        this.quests = data.quests || [];
        this.roomDesc = data.roomDesc || '';
        this.shortName = data.shortName || '';
        this.uuid = data.uuid || uuid();
    }

    public get behaviors(): Map<string, SimpleMap | true> {
        return this._behaviors;
    }

    public get isNpc(): boolean {
        return true;
    }

    public emit(name: string | symbol, ...args: any[]): boolean {
        /*
         * Squelch events on a pruned entity. Attempts to prevent the case
         * where an entity has been effectively removed from the game but
         * somehow still triggered a listener. Set by respective
         * EntityManager class
         */
        if (this.__pruned) {
            this.removeAllListeners();

            return false;
        }

        return super.emit(name, ...args);
    }

    public getBehavior(name: string): SimpleMap | true {
        return this._behaviors.get(name);
    }

    public hasBehavior(name: string): boolean {
        return this._behaviors.has(name);
    }

    public hydrate(state: GameState): boolean {
        super.hydrate(state);

        state.mobManager.add(this);

        this.setupBehaviors(state.mobBehaviorManager);

        for (const defaultItemId of this.defaultItems) {
            Logger.verbose(`\tDIST: Adding item [${defaultItemId}] to npc [${this.name}]`);
            const newItem = state.itemFactory.create(defaultItemId, this.area);

            newItem.hydrate(state);
            state.itemManager.add(newItem);
            this.addItem(newItem);
        }

        for (const [slot, defaultEqId] of Object.entries(this.defaultEquipment)) {
            /* eslint-disable-next-line max-len */
            Logger.verbose(`\tDIST: Equipping item [${defaultEqId}] to npc [${this.name}] in slot [${slot}]`);

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
    public moveTo(nextRoom, onMoved = noop): void {
        const prevRoom = this.room;

        if (this.room) {
            /**
             * @event Room#npcLeave
             */
            this.room.emit('npcLeave', this, nextRoom);
            this.room.removeNpc(this);
        }

        this.room = nextRoom;
        nextRoom.addNpc(this);

        onMoved();

        /**
         * @event Room#npcEnter
         */
        nextRoom.emit('npcEnter', this, prevRoom);

        /**
         * @event Npc#enterRoom
         */
        this.emit('enterRoom', nextRoom);
    }

    /**
     * Attach this entity's behaviors from the manager
     */
    public setupBehaviors(manager: BehaviorManager): void {
        /* eslint-disable-next-line prefer-const */
        for (let [name, config] of this.behaviors) {
            const behavior = manager.get(name);

            if (behavior) {
                // behavior may be a boolean in which case it will be `behaviorName: true`
                config = config === true ? {} : config;
                behavior.attach(this, config);
            }
            else {
                Logger.warn(sprintf(
                    'No script found for [%1$s] behavior `%2$s`',
                    this.constructor.name,
                    name
                ));
            }
        }
    }
}

export default Npc;