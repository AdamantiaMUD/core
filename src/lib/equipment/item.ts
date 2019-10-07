import uuid from 'uuid/v4';

import GameState from '../game-state';
import ItemType from './item-type';
import ScriptableEntity, {
    ScriptableEntityDefinition,
    SerializedScriptableEntity
} from '../entities/scriptable-entity';
import Serializable from '../data/serializable';

export interface ItemDefinition extends ScriptableEntityDefinition {
    description?: string;
    flags?: string[];
    id: string;
    keywords: string[];
    name: string;
    roomDesc: string;
    type: ItemType;
}

export interface SerializedItem extends SerializedScriptableEntity {}

export class Item extends ScriptableEntity implements Serializable {
    private readonly _definition: ItemDefinition;
    private readonly _description: string;
    private readonly _flags: string[];
    private readonly _keywords: string[];
    private readonly _name: string;
    private readonly _roomDesc: string;
    private readonly _type: ItemType;
    private readonly _uuid: string = uuid();

    public constructor(def: ItemDefinition) {
        super(def);

        this._definition = def;

        this._description = def.description ?? '';
        this._flags = def.flags ?? [];
        this._keywords = def.keywords;
        this._name = def.name;
        this._roomDesc = def.roomDesc;
        this._type = def.type;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public deserialize(data: SerializedItem, state?: GameState): void {
        super.deserialize(data, state);
    }

    public serialize(): SerializedItem {
        return super.serialize();
    }
}

export default Item;
