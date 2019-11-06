import EventEmitter from 'events';

import CharacterAttributes, {SerializedCharacterAttributes} from '../attributes/character-attributes';
import CharacterCombat from '../combat/character-combat';
import CommandQueue from '../commands/command-queue';
import Effect from '../effects/effect';
import EffectList from '../effects/effect-list';
import GameState from '../game-state';
import Inventory from '../equipment/inventory';
import Item from '../equipment/item';
import Npc from '../mobs/npc';
import Room from '../locations/room';
import ScriptableEntity, {SerializedScriptableEntity} from '../entities/scriptable-entity';
import Serializable from '../data/serializable';
import TransportStream from '../communication/transport-stream';
import {
    CharacterAttributeUpdateEvent,
    CharacterEquipItemEvent,
    CharacterFollowedTargetEvent,
    CharacterGainedFollowerEvent,
    CharacterLostFollowerEvent,
    CharacterUnequipItemEvent,
    CharacterUnfollowedTargetEvent,
} from './character-events';
import {
    EquipAlreadyEquippedError,
    EquipSlotTakenError,
    InventoryFullError,
} from '../equipment/equipment-errors';
import {ItemEquippedEvent, ItemUnequippedEvent} from '../equipment/item-events';

export interface SerializedCharacter extends SerializedScriptableEntity {
    attributes: SerializedCharacterAttributes;
    level: number;
    name: string;
    room: string;
}

const DEFAULT_MAX_INVENTORY = 20;

export class Character extends ScriptableEntity implements Serializable {
    protected readonly _attributes: CharacterAttributes;
    protected readonly _combat: CharacterCombat;
    protected readonly _commandQueue: CommandQueue = new CommandQueue();
    protected readonly _effects: EffectList;
    protected readonly _equipment: Map<string, Item> = new Map();
    protected readonly _followers: Set<Character> = new Set();
    protected _following: Character = null;
    protected _inventory: Inventory = null;
    protected _level: number = 1;
    public name: string = '';
    public room: Room = null;
    public socket: TransportStream<EventEmitter> = null;

    constructor() {
        super();

        this._attributes = new CharacterAttributes(this);
        this._combat = new CharacterCombat(this);
        this._effects = new EffectList(this);
    }

    public get attributes(): CharacterAttributes {
        return this._attributes;
    }

    public get combat(): CharacterCombat {
        return this._combat;
    }

    public get commandQueue(): CommandQueue {
        return this._commandQueue;
    }

    public get effects(): EffectList {
        return this._effects;
    }

    public get followers(): Set<Character> {
        return this._followers;
    }

    public get following(): Character {
        return this._following;
    }

    public get equipment(): Map<string, Item> {
        return this._equipment;
    }

    public get inventory(): Inventory {
        if (this._inventory === null) {
            this._inventory = new Inventory();

            if (!this.isNpc() && !isFinite(this._inventory.getMax())) {
                this._inventory
                    .setMax(this._state.config.get(
                        'maxPlayerInventory',
                        DEFAULT_MAX_INVENTORY
                    ));
            }
        }

        return this._inventory;
    }

    public get level(): number {
        return this._level;
    }

    public addEffect(effect: Effect): boolean {
        return this._effects.add(effect);
    }

    public addFollower(follower: Character): void {
        this._followers.add(follower);
        follower.setFollowing(this);

        this.dispatch(new CharacterGainedFollowerEvent({follower}));
    }

    public addItem(item: Item): void {
        this._inventory.addItem(item);

        item.carriedBy = this;
    }

    public deserialize(data: SerializedCharacter, state: GameState): void {
        super.deserialize(data, state);

        this._attributes.deserialize(data.attributes ?? {}, state);

        this._level = data.level;
        this.name = data.name;

        if (data.room) {
            this.room = state.roomManager.getRoom(data.room);
        }
        else {
            const startingRoom = state.config.get('startingRoom');
            this.room = state.roomManager.getRoom(startingRoom);
        }
    }

    public equip(item: Item, slot: string): void {
        if (this._equipment.has(slot)) {
            throw new EquipSlotTakenError();
        }
        if (item.getMeta('equippedBy')) {
            throw new EquipAlreadyEquippedError();
        }

        if (this._inventory instanceof Inventory) {
            this.removeItem(item);
        }

        this._equipment.set(slot, item);
        item.setMeta('equippedBy', this);

        item.dispatch(new ItemEquippedEvent({wearer: this}));

        this.dispatch(new CharacterEquipItemEvent({item, slot}));
    }

    public follow(target: Character): void {
        if (target === this) {
            this.unfollow();

            return;
        }

        this._following = target;
        target.addFollower(this);

        this.dispatch(new CharacterFollowedTargetEvent({target}));
    }

    /**
     * Get the current value of an attribute (base modified by delta)
     */
    public getAttribute(attr: string, defaultValue: number = null): number {
        if (!this._attributes.has(attr)) {
            if (defaultValue !== null) {
                return defaultValue;
            }

            throw new RangeError(`Character does not have attribute [${attr}]`);
        }

        return this.getMaxAttribute(attr) + this._attributes.get(attr).delta;
    }

    public getAttributeNames(): IterableIterator<string> {
        return this._attributes.getAttributeNames();
    }

    /**
     * Get the base value for a given attribute
     */
    public getBaseAttribute(attr: string): number {
        const att = this._attributes.get(attr);

        return att?.base;
    }

    public getItem(itemRef: string): Item {
        return this._inventory.items.get(itemRef);
    }

    /**
     * Get current maximum value of attribute (as modified by effects.)
     */
    public getMaxAttribute(attr: string): number {
        if (!this._attributes.has(attr)) {
            throw new RangeError(`Character does not have attribute [${attr}]`);
        }

        const attribute = this._attributes.get(attr);
        // const currentVal = this.effects.evaluateAttribute(attribute);
        const currentVal = attribute.base ?? 0;

        if (!attribute.formula) {
            return currentVal;
        }

        const {formula} = attribute;

        const requiredValues = formula.requires.map(att => this.getMaxAttribute(att));

        /* eslint-disable-next-line no-useless-call */
        return formula.evaluate.apply(formula, [
            attribute,
            this,
            currentVal,
            ...requiredValues,
        ]);
    }

    public hasEffectType(type: string): boolean {
        return this._effects.hasEffectType(type);
    }

    public hasFollower(target: Character): boolean {
        return this._followers.has(target);
    }

    public hasItem(itemRef: string): boolean {
        return this._inventory.items.has(itemRef);
    }

    public isNpc(): this is Npc {
        return false;
    }

    public modifyAttribute(attr: string, amount: number): void {
        if (!this._attributes.has(attr)) {
            throw new Error(`Invalid attribute ${attr}`);
        }

        this._attributes.get(attr).modify(amount);
        this.dispatch(new CharacterAttributeUpdateEvent({attr: attr, value: this.getAttribute(attr)}));
    }

    public removeEffect(effect: Effect): void {
        this._effects.remove(effect);
    }

    public removeFollower(follower: Character): void {
        this._followers.delete(follower);
        follower._following = null;

        this.dispatch(new CharacterLostFollowerEvent({follower}));
    }

    /**
     * Remove an item from the character's inventory. Warning: This does not automatically place the
     * item in any particular place. You will need to manually add it to the room or another
     * character's inventory
     */
    public removeItem(item: Item): void {
        this._inventory.removeItem(item);

        /*
         * if we removed the last item unset the inventory
         * This ensures that when it's reloaded it won't try to set
         * its default inventory. Instead it will persist the fact
         * that all the items were removed from it
         */
        if (this._inventory.size === 0) {
            this._inventory = null;
        }

        item.carriedBy = null;
    }

    public resetAttribute(attr: string): void {
        if (!this._attributes.has(attr)) {
            throw new Error(`Invalid attribute ${attr}`);
        }

        this._attributes.get(attr).reset();

        this.dispatch(new CharacterAttributeUpdateEvent({attr: attr, value: this.getAttribute(attr)}));
    }

    public serialize(): SerializedCharacter {
        return {
            ...super.serialize(),

            attributes: this._attributes.serialize(),
            level: this._level,
            name: this.name,
            room: this.room.entityReference,
        };
    }

    public setFollowing(target: Character): void {
        this._following = target;
    }

    /**
     * Remove equipment in a given slot and move it to the character's inventory
     */
    public unequip(slot: string): void {
        if (this._inventory.isFull) {
            throw new InventoryFullError();
        }

        const item = this.equipment.get(slot);

        item.setMeta('equippedBy', null);

        this.equipment.delete(slot);

        item.dispatch(new ItemUnequippedEvent({wearer: this}));

        this.dispatch(new CharacterUnequipItemEvent({item, slot}));
        this.addItem(item);
    }

    /**
     * Stop following whoever the character was following
     */
    public unfollow(): void {
        this._following.removeFollower(this);

        this.dispatch(new CharacterUnfollowedTargetEvent({target: this._following}));
        this._following = null;
    }
}

export default Character;
