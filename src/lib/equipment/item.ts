import uuid from 'uuid/v4';
import {sprintf} from 'sprintf-js';

import Area from '../locations/area';
import Character from '../entities/character';
import ItemType from './item-type';
import Room from '../locations/room';
import ScriptableEntity from '../entities/scriptable-entity';
import Serializable from '../data/serializable';
import {BehaviorDefinition} from '../behaviors/behavior-manager';
import {SimpleMap} from '../../../index';

export interface ItemDefinition {
    behaviors?: {[key: string]: SimpleMap};
    closeable?: boolean;
    closed?: boolean;
    description?: string;
    flags?: string[];
    id: string;
    items?: string[];
    keywords: string[];
    locked?: boolean;
    lockedBy?: string;
    maxItems?: number;
    metadata?: SimpleMap;
    name: string;
    roomDesc: string;
    script?: string;
    type: ItemType;
}

export class Item extends ScriptableEntity implements Serializable {
    /* eslint-disable lines-between-class-members */
    public __hydrated: boolean = false;
    public area: Area;
    public behaviors: Map<string, BehaviorDefinition> = new Map();
    public carriedBy: Character | Item = null;
    public closeable: boolean = false;
    public closed: boolean = false;
    public defaultItems: string[];
    public definition: ItemDefinition;
    public description: string;
    public entityReference: string;
    public equippedBy: Character = null;
    public flags: string[];
    public id: string;
    public inventory: Inventory = null;
    public isEquipped: boolean = false;
    public keywords: string[];
    public locked: boolean = false;
    public lockedBy: string;
    public maxItems: number = Infinity;
    public metadata: SimpleMap;
    public name: string;
    public room: Room = null;
    public roomDesc: string;
    public script: string;
    public sourceRoom: Room;
    public type: ItemType;
    public uuid: string = uuid();
    /* eslint-enable lines-between-class-members */

    public constructor(ref: string, def: ItemDefinition, area: Area) {
        super();

        const validate = ['keywords', 'name', 'id'];

        for (const prop of validate) {
            if (!(prop in def)) {
                throw new ReferenceError(sprintf(
                    'Item in area [%1$s] missing required property [%2$s]',
                    area.name,
                    prop
                ));
            }
        }

        this.definition = def;

        this.id = def.id;
        this.keywords = def.keywords;
        this.name = def.name;
        this.roomDesc = def.roomDesc;
        this.type = def.type;

        this.area = area;
        this.behaviors = new Map(Object.entries(def.behaviors as SimpleMap || {}));
        this.defaultItems = def.items || [];
        this.description = def.description || 'Nothing special.';
        this.entityReference = ref;
        this.metadata = def.metadata || {};
        this.script = def.script || null;
        this.flags = def.flags || [];

        if (this.type === ItemType.CONTAINER) {
            this.initializeContainer(def);
        }
    }

    private setupInventory(): void {
        if (!this.inventory) {
            this.inventory = new Inventory();
            this.inventory.setMax(this.maxItems);
        }
    }

    /**
     * Add an item to this item's inventory
     */
    public addItem(item: Item): void {
        this.setupInventory();
        this.inventory.addItem(item);
        item.carriedBy = this;
    }

    /**
     * Close a container-like object
     */
    public close(): void {
        if (this.closed || !this.closeable) {
            return;
        }

        this.closed = true;
    }

    /**
     * Helper to find the game entity that ultimately has this item in their
     * Inventory in the case of nested containers. Could be an item, player, or
     * @return {Character|Item|null} owner
     */
    public findCarrier(): Character | Item {
        let owner = this.carriedBy;

        while (owner) {
            if (!(owner instanceof Item)) {
                return owner;
            }

            if (!owner.carriedBy) {
                return owner;
            }

            owner = owner.carriedBy;
        }

        return null;
    }

    public hasKeyword(keyword: string): boolean {
        return this.keywords.indexOf(keyword) > -1;
    }

    public hydrate(state: GameState, model: SerializedItem = {} as SerializedItem): void {
        if (this.__hydrated) {
            Logger.warn('Attempted to hydrate already hydrated item.');

            return;
        }

        /*
         * perform deep copy if behaviors is set to prevent sharing of the
         * object between item instances
         */
        if (model.behaviors) {
            const behaviors = JSON.parse(JSON.stringify(model.behaviors));

            this.behaviors = new Map(Object.entries(behaviors));
        }

        this.setupBehaviors(state.ItemBehaviorManager);

        this.description = model.description || this.description;
        this.keywords = model.keywords || this.keywords;
        this.name = model.name || this.name;
        this.roomDesc = model.roomDesc || this.roomDesc;
        this.metadata = JSON.parse(JSON.stringify(model.metadata || this.metadata));
        this.closed = 'closed' in model ? model.closed : this.closed;
        this.locked = 'locked' in model ? model.locked : this.locked;

        if (typeof this.area === 'string') {
            this.area = state.AreaManager.getArea(this.area);
        }

        // if the item was saved with a custom inventory hydrate it
        if (model.inventory) {
            this.initializeInventory(model.inventory);

            this.inventory.hydrate(state, this);
        }
        else {
            // otherwise load its default inv
            this.defaultItems.forEach(defaultItemId => {
                Logger.verbose(`\tDIST: Adding item [${defaultItemId}] to item [${this.name}]`);
                const newItem = state.ItemFactory.create(defaultItemId, this.area);

                newItem.hydrate(state);
                state.ItemManager.add(newItem);
                this.addItem(newItem);
            });
        }

        this.__hydrated = true;
    }

    private initializeContainer(def: ItemDefinition): void {
        this.maxItems = def.maxItems || Infinity;

        if (
            typeof def.closeable === 'boolean'
            || typeof def.closed === 'boolean'
            || typeof def.locked === 'boolean'
        ) {
            this.closeable = true;
        }

        this.closed = def.closed || false;
        this.locked = def.locked || false;
        this.lockedBy = def.lockedBy || null;
    }

    public isInventoryFull(): boolean {
        this.setupInventory();

        return this.inventory.isFull;
    }

    /**
     * Create an Inventory object from a serialized inventory
     * @param {object} inventory Serialized inventory
     */
    public initializeInventory(inventory): void {
        this.inventory = new Inventory(inventory);
        this.inventory.setMax(this.maxItems);
    }

    /**
     * Lock a container-like object
     */
    public lock(): void {
        if (this.locked || !this.closeable) {
            return;
        }

        this.close();
        this.locked = true;
    }

    /**
     * Open a container-like object
     */
    public open(): void {
        if (!this.closed) {
            return;
        }

        this.closed = false;
    }

    /**
     * Remove an item from this item's inventory
     */
    public removeItem(item: Item): void {
        this.inventory.removeItem(item);

        /*
         * if we removed the last item unset the inventory
         * This ensures that when it's reloaded it won't try to set
         * its default inventory. Instead it will persist the fact
         * that all the items were removed from it
         */
        if (!this.inventory.size) {
            this.inventory = null;
        }

        item.carriedBy = null;
    }

    public serialize(): SerializedItem {
        const behaviors: {[key: string]: BehaviorDefinition} = {};

        for (const [key, val] of this.behaviors) {
            behaviors[key] = val;
        }

        return {
            entityReference: this.entityReference,
            inventory: this.inventory ? this.inventory.serialize() : null,

            /*
             * metadata is serialized/hydrated to save the state of the item during gameplay
             * example: the players a food that is poisoned, or a sword that is enchanted
             */
            metadata: this.metadata,

            description: this.description,
            keywords: this.keywords,
            name: this.name,
            roomDesc: this.roomDesc,

            closed: this.closed,
            locked: this.locked,

            /*
             * behaviors are serialized in case their config was modified during gameplay
             * and that state needs to persist (charges of a scroll remaining, etc)
             */
            behaviors: behaviors,
        };
    }

    /**
     * Unlock a container-like object
     */
    public unlock(): void {
        if (!this.locked) {
            return;
        }

        this.locked = false;
    }
}

export default Item;
