import {v4 as uuid} from 'uuid';

import Inventory from './inventory';
import ItemType from './item-type';
import Logger from '../common/logger';
import ScriptableEntity from '../entities/scriptable-entity';

import type Area from '../locations/area';
import type CharacterInterface from '../characters/character-interface';
import type GameStateData from '../game-state-data';
import type ItemDefinition from './item-definition';
import type Room from '../locations/room';
import type Serializable from '../data/serializable';
import type SerializedItem from './serialized-item';

export class Item extends ScriptableEntity implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public sourceRoom: Room | null = null;

    private readonly _area: Area;
    private readonly _definition: ItemDefinition;
    private readonly _flags: string[];
    private readonly _inventory: Inventory = new Inventory();
    private readonly _keywords: string[];
    private readonly _level: number;
    private readonly _maxItems: number;
    private readonly _roomDesc: string;
    private readonly _type: ItemType;

    private _carriedBy: CharacterInterface | Item | null = null;
    private _room: Room | null = null;
    private _uuid: string = uuid();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(def: ItemDefinition, area: Area) {
        super(def);

        this._definition = def;

        this._area = area;
        this._description = def.description ?? '';
        this._flags = def.flags ?? [];
        this._keywords = def.keywords;
        this._level = def.level ?? 0;
        this._maxItems = def.maxItems ?? Infinity;
        this._name = def.name;
        this._roomDesc = def.roomDesc;
        this._type = def.type;
    }

    public get area(): Area {
        return this._area;
    }

    public get carriedBy(): CharacterInterface | Item | null {
        return this._carriedBy;
    }

    public get flags(): string[] {
        return this._flags;
    }

    public get inventory(): Inventory | null {
        if (this._type !== ItemType.CONTAINER) {
            // @TODO: throw?
            return null;
        }

        return this._inventory;
    }

    public get keywords(): string[] {
        return this._keywords;
    }

    public get level(): number {
        return this._level;
    }

    public get maxItems(): number {
        return this._maxItems;
    }

    public get room(): Room | null {
        return this._room;
    }

    public get roomDesc(): string {
        return this._roomDesc;
    }

    public get type(): ItemType {
        return this._type;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public addItem(item: Item): void {
        if (this._type !== ItemType.CONTAINER) {
            // @TODO: throw
            return;
        }

        item.setCarrier(this);

        this._inventory.addItem(item);
    }

    public deserialize(data: SerializedItem, state: GameStateData): void {
        super.deserialize(data, state);

        this._uuid = data.uuid;

        this.__hydrated = true;
    }

    public hydrate(state: GameStateData): void {
        if (this.__hydrated) {
            Logger.warn('Attempted to hydrate already hydrated item.');

            return;
        }

        super.hydrate(state);
    }

    public removeItem(item: Item): void {
        if (this._type !== ItemType.CONTAINER) {
            // @TODO: throw
            return;
        }

        item.setCarrier(null);

        this._inventory.removeItem(item);
    }

    public serialize(): SerializedItem {
        return {
            ...super.serialize(),
            uuid: this._uuid,
        };
    }

    public setCarrier(carrier: CharacterInterface | Item | null): void {
        this._carriedBy = carrier;
    }

    public setRoom(room: Room | null): void {
        this._room = room;
    }
}

export default Item;
