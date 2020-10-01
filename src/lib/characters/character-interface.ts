import type {EventEmitter} from 'events';

import type CharacterAttributes from '../attributes/character-attributes';
import type CharacterCombat from '../combat/character-combat';
import type CommandQueue from '../commands/command-queue';
import type Effect from '../effects/effect';
import type EffectList from '../effects/effect-list';
import type GameStateData from '../game-state-data';
import type Inventory from '../equipment/inventory';
import type Item from '../equipment/item';
import type Room from '../locations/room';
import type ScriptableEntityInterface from '../entities/scriptable-entity-interface';
import type TransportStream from '../communication/transport-stream';
import type {SerializedCharacter} from './character';

export interface CharacterInterface extends ScriptableEntityInterface {
    readonly attributes: CharacterAttributes;
    readonly combat: CharacterCombat;
    readonly commandQueue: CommandQueue;
    readonly effects: EffectList;
    readonly followers: Set<CharacterInterface>;
    readonly following: CharacterInterface | null;
    readonly equipment: Map<string, Item>;
    readonly inventory: Inventory;
    readonly level: number;

    name: string;
    room: Room | null;
    socket: TransportStream<EventEmitter> | null;

    addEffect: (effect: Effect) => boolean;
    addFollower: (follower: CharacterInterface) => void;
    addItem: (item: Item) => void;
    deserialize: (data: SerializedCharacter, state: GameStateData) => void;
    equip: (item: Item, slot: string) => void;
    follow: (target: CharacterInterface) => void;
    getAttribute: (attr: string, defaultValue?: number | null) => number;
    getAttributeNames: () => IterableIterator<string>;
    getBaseAttribute: (attr: string) => number;
    getItem: (itemRef: string) => Item | null;
    getMaxAttribute: (attr: string) => number;
    hasEffectType: (type: string) => boolean;
    hasFollower: (target: CharacterInterface) => boolean;
    hasItem: (itemRef: string) => boolean;
    modifyAttribute: (attr: string, amount: number) => void;
    removeEffect: (effect: Effect) => void;
    removeFollower: (follower: CharacterInterface) => void;
    removeItem: (item: Item) => void;
    resetAttribute: (attr: string) => void;
    serialize: () => SerializedCharacter;
    setFollowing: (target: CharacterInterface | null) => void;
    unequip: (slot: string) => void;
    unfollow: () => void;
}

export default CharacterInterface;
