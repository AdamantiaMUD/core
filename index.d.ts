import EventEmitter from 'events';
import {AddressInfo} from 'net';
import {CommanderStatic} from 'commander';

export declare class Ability {
    configureEffect: (effect: Effect) => Effect;
    cooldownGroup: string;
    cooldownLength: number;
    effect: string;
    flags: AbilityFlag[];
    id: string;
    info: (skill?: Ability, player?: Character) => string;
    initiatesCombat: boolean;
    lag: number;
    name: string;
    options: SimpleMap;
    requiresTarget: boolean;
    resource: AbilityResource | AbilityResource[];
    run: AbilityRunner;
    state: GameState;
    targetSelf: boolean;
    type: AbilityType;

    constructor(id: string, def: AbilityDefinition, state: GameState);
    activate(character: Character): void;
    cooldown(character: Character): void;
    execute(args: string, actor: Character, target?: Character): void;
    getCooldownId(): string;
    getDefaultCooldownConfig(): EffectDefinition;
    hasEnoughResource(character: Character, resource: {attribute: string; cost: number}): boolean;
    hasEnoughResources(character: Character): boolean;
    onCooldown(character: Character): Effect | false;
    payResourceCost(character: Character, resource): boolean;
    payResourceCosts(character: Character): boolean;
}

export interface AbilityDefinition {
    configureEffect?: (effect: Effect) => Effect;
    cooldown?: number | {group: string; length: number};
    effect?: string;
    flags?: AbilityFlag[];
    info?: (skill?: Ability, player?: Player) => string;
    initiatesCombat: boolean;
    name: string;
    options: SimpleMap;
    requiresTarget: boolean;
    resource?: AbilityResource | AbilityResource[];
    run?: (state?: GameState) => AbilityRunner;
    targetSelf: boolean;
    type: AbilityType;
}

export enum AbilityFlag {
    ACTIVE = 'ACTIVE',
    PASSIVE = 'PASSIVE',
}

export interface AbilityResource {
    attribute: string;
    cost: number;
}

export type AbilityRunner = (
    skill: Ability,
    args: string,
    source: Character,
    target?: Character
) => void | false;

export enum AbilityType {
    SKILL = 'SKILL',
    SPELL = 'SPELL',
}

export declare class Area extends ScriptableEntity implements Broadcastable {
    readonly bundle: string;
    readonly name: string;
    readonly npcs: Set<Npc>;
    readonly rooms: Map<string, any>;

    constructor(bundle: string, name: string, manifest: AreaManifest);
    addNpc(npc: Npc): void;
    addRoom(room: Room): void;
    getBroadcastTargets(): Player[];
    hydrate(state: GameState): void;
    removeNpc(npc: Npc): void;
}

export interface AreaDefinition extends ScriptableEntityDefinition {
    bundle: string;
    manifest: AreaManifest;
    npcs: string[];
    quests: string[];
    rooms: string[];
}

export interface AreaManifest {
    metadata?: SimpleMap;
    name: string;
}

export declare class Attribute implements Serializable {
    base: number;
    delta: number;
    formula: AttributeFormula;
    metadata: SimpleMap;
    name: string;

    constructor(name: string, base: number, delta?: number, formula?: AttributeFormula, metadata?: SimpleMap);
    deserialize(data: SerializedAttribute): void;
    modify(amount: number): void;
    reset(): void;
    serialize(): SerializedAttribute;
    setBase(amount: number): void;
    setDelta(amount: number): void;
}

export declare class AttributeFormula {
    requires: string[];

    constructor(requires: string[], fn: (...args: number[]) => number)
    evaluate(attribute: Attribute, ...args: number[]): number
}

export interface Broadcastable {
    getBroadcastTargets(): Player[];
}

export declare class BundleManager {
    public constructor(state: GameState);

    public loadBundles(): Promise<void>;
}

export declare class Character extends ScriptableEntity implements Serializable {
    name: string;
    room: Room;
    socket: TransportStream<any>;

    readonly attributes: CharacterAttributes;
    readonly combat: CharacterCombat;
    readonly commandQueue: CommandQueue;
    readonly effects: EffectList;
    readonly followers: Set<Character>;
    readonly following: Character;
    readonly equipment: Map<string, Item>;
    readonly inventory: Inventory;
    readonly level: number;

    constructor();
    addEffect(effect: Effect): boolean;
    addFollower(follower: Character): void;
    addItem(item: Item): void;
    deserialize(data: SerializedCharacter, state: GameState): void;
    equip(item: Item, slot: string): void;
    follow(target: Character): void;
    getAttribute(attr: string, defaultValue?: number): number;
    getAttributeNames(): IterableIterator<string>;
    getBaseAttribute(attr: string): number;
    getItem(itemRef: string): Item;
    getMaxAttribute(attr: string): number;
    hasEffectType(type: string): boolean;
    hasFollower(target: Character): boolean;
    hasItem(itemRef: string): boolean;
    isNpc(): this is Npc;
    modifyAttribute(attr: string, amount: number): void;
    removeEffect(effect: Effect): void;
    removeFollower(follower: Character): void;
    removeItem(item: Item): void;
    resetAttribute(attr: string): void;
    serialize(): SerializedCharacter;
    setFollowing(target: Character): void;
    unequip(slot: string): void;
    unfollow(): void;
}

export declare class CharacterAttributes implements Serializable {
    constructor(target: Character);
    add(attribute: Attribute): void;
    deserialize(data: SerializedCharacterAttributes, state: GameState): void;
    get(key: string): Attribute;
    getAttributes(): IterableIterator<[string, Attribute]>;
    getAttributeNames(): IterableIterator<string>;
    has(key: string): boolean;
    modify(key: string, amount: number): void;
    reset(): void;
    serialize(): SerializedCharacterAttributes;
}

export interface CharacterClass {}

export declare class CharacterCombat {
    constructor(char: Character);
    get combatants(): Set<Character>;
    addCombatant(target: Character): void;
    disengage(): void;
    evaluateIncomingDamage(damage: Damage, currentAmount: number): number;
    evaluateOutgoingDamage(damage: Damage, currentAmount: number): number;
    initiate(target: Character, lag?: number): void;
    isFighting(target?: Character): boolean;
    removeCombatant(target: Character): void;
}

export declare class CommandQueue {
    readonly hasPending: boolean;
    readonly lagRemaining: number;
    readonly msTilNextRun: number;
    readonly queue: ExecutableCommand[];

    addLag(amount: number): void;
    enqueue(executable: ExecutableCommand, lag: number): number;
    execute(): boolean;
    flush(): void;
    getMsTilRun(commandIndex: number): number;
    getTimeTilRun(commandIndex: number): number;
    reset(): void;
}

export declare class Config {
    public get(key: string, fallback?: any): any;
    public load(data: any): void;
    public set(key: string, value: any): void;
}

export declare class Damage {
    amount: number;
    attacker: Character;
    attribute: string;
    metadata: SimpleMap;
    source: DamageSource;

    constructor(attribute: string, amount: number, attacker?: Character, source?: DamageSource, metadata?: SimpleMap);
    commit(target: Character): void;
    evaluate(target: Character): number;
}

export type DamageSource = Character | Effect | Item | Room | Ability;

export interface Door {
    closed?: boolean;
    locked?: boolean;
    lockedBy?: string;
    oneWay?: boolean;
}

export declare class Effect extends EventEmitter implements Serializable {
    ability: Ability;
    active: boolean;
    attacker: Character;
    config: EffectConfig;
    duration: number;
    flags: EffectFlag[];
    id: string;
    modifiers: EffectModifiers;
    paused: number;
    startedAt: number;
    state: EffectState;
    target: Character;

    readonly name: string;
    readonly description: string;
    readonly elapsed: number;
    readonly remaining: number;

    constructor(id, def);
    activate(): void;
    deactivate(): void;
    hydrate(state: GameState, data: any): void;
    isCurrent(): boolean;
    modifyAttribute(attrName: string, currentValue: number): number;
    modifyIncomingDamage(damage: Damage, currentAmount: number): number;
    modifyOutgoingDamage(damage: Damage, currentAmount: number): number;
    pause(): void;
    remove(): void;
    resume(): void;
    serialize(): SerializedEffect;
}

export type EffectAttributeModifier = (effect: Effect, current: number) => number;

export type EffectAttributeModifierFunction = (
    effect: Effect,
    attribute: string,
    current: number
) => number;

export interface EffectConfig {
    autoActivate?: boolean;
    description?: string;
    duration?: number;
    hidden?: boolean;
    maxStacks?: number;
    name: string;
    persists?: boolean;
    refreshes?: boolean;
    tickInterval?: number;
    type?: string;
    unique?: boolean;
}

export interface EffectDefinition {
    config: EffectConfig;
    flags?: EffectFlag[];
    listeners?: EffectListenersDefinition | EffectListenersDefinitionFactory;
    modifiers?: EffectModifiers;
    state?: SimpleMap;
}

export enum EffectFlag {
    BUFF = 'BUFF',
    DEBUFF = 'DEBUFF',
}

export declare class EffectList implements Serializable {
    readonly size: number;

    constructor(target: Character);
    add(effect: Effect): boolean;
    clear(): void;
    emit(event: string | symbol, ...args: any[]): boolean;
    entries(): Effect[];
    evaluateAttribute(attr: Attribute): number;
    evaluateIncomingDamage(damage: Damage, amount: number): number;
    evaluateOutgoingDamage(damage: Damage, amount: number): number;
    hasEffectType(type: string): boolean;
    hydrate(state): void;
    getByType(type: string): Effect;
    remove(effect: Effect): void;
    serialize(): SerializedEffect[];
    validateEffects(): void;
}

export interface EffectListenersDefinition {
    effectActivated?: (effect?: Effect) => void;
    effectAdded?: (effect?: Effect) => void;
    effectDeactivated?: (effect?: Effect) => void;
    effectRefreshed?: (effect?: Effect) => void;
    [key: string]: (effect?: Effect, ...args: any[]) => void;
}

export type EffectListenersDefinitionFactory = (state: GameState) => EffectListenersDefinition;

export type EffectModifier = (effect: Effect, ...args: any[]) => any;

export interface EffectModifiers {
    attributes?: EffectAttributeModifierFunction | {[key: string]: EffectAttributeModifier};
    incomingDamage?: (effect: Effect, source: Damage, amount: number) => number;
    outgoingDamage?: (effect: Effect, source: Damage, amount: number) => number;
    [key: string]: EffectModifier | {[key: string]: EffectModifier};
}

export interface EffectState {
    lastTick?: number;
    stacks?: number;
    tickInterval?: number;
    ticks?: number;
    [key: string]: any;
}

export declare class EventManager {
    public events: Map<string, Set<Function>>;

    public add(name: string, listener: Function): void;
    public attach(emitter: EventEmitter, config?: any): void;
    public detach(emitter: EventEmitter, eventNames?: string | string[]): void;
    public get(name: string): Set<Function>;
}

export type ExecutableCommand = {
    execute(): void;
    label: string;
    lag: number;
}

export declare class GameEntity extends EventEmitter implements Metadatable, Serializable {
    __pruned: boolean;
    __hydrated: boolean;
    entityReference: string;

    constructor(def?: GameEntityDefinition);
    deserialize(data?: SerializedGameEntity, state?: GameState): void;
    getMeta(key: string): any;
    hydrate(state: GameState): void;
    serialize(): SerializedGameEntity;
    setMeta(key: string, value: any): void;
}

export interface GameEntityDefinition {
    metadata?: SimpleMap;
}

export declare class GameServer extends EventEmitter {
    public shutdown(): void;
    public startup(commander: CommanderStatic): void;
}

export declare class GameState {
    public config: Config;
    public server: GameServer;
    public serverEventManager: EventManager;

    public constructor(config: Config);

    public attachServer(): void;
    public startServer(commander: CommanderStatic): void;
}

export declare class Heal extends Damage {
    commit(target: Character): void;
}

export declare class Inventory implements Serializable {
    maxSize: number;

    readonly isFull: boolean;
    readonly items: Map<string, Item>;
    readonly size: number;

    deserialize(data: SerializedInventory, carriedBy: Character | Item, state?: GameState): void;
    addItem(item: Item): void;
    getMax(): number;
    removeItem(item: Item): void;
    serialize(): SerializedInventory;
    setMax(size: number): void;
}

export declare class Item extends ScriptableEntity implements Serializable {
    carriedBy: Character | Item;
    room: Room;
    sourceRoom: Room;

    readonly area: Area;
    readonly description: string;
    readonly flags: string[];
    readonly inventory: Inventory;
    readonly keywords: string[];
    readonly level: number;
    readonly maxItems: number;
    readonly name: string;
    readonly roomDesc: string;
    readonly type: ItemType;
    readonly uuid: string;

    constructor(def: ItemDefinition, area: Area);
    addItem(item: Item): void;
    deserialize(data: SerializedItem, state?: GameState): void;
    hydrate(state: GameState): void;
    removeItem(item: Item): void;
    serialize(): SerializedItem;
}

export interface ItemDefinition extends ScriptableEntityDefinition {
    description?: string;
    flags?: string[];
    id: string;
    keywords: string[];
    level?: number;
    maxItems?: number;
    name: string;
    roomDesc: string;
    type: ItemType;
}

export enum ItemType {
    ARMOR = 'ARMOR',
    CONTAINER = 'CONTAINER',
    OBJECT = 'OBJECT',
    POTION = 'POTION',
    RESOURCE = 'RESOURCE',
    TRASH = 'TRASH',
    WEAPON = 'WEAPON',
}

export declare class Logger {
    public static error(msg: string, ...messages: string[]): void;
    public static log(msg: string, ...messages: string[]): void
    public static setFileLogging(uri: string): void;
    public static setLevel(level: string): void;
    public static verbose(msg: string, ...messages: string[]): void;
    public static warn(msg: string, ...messages: string[]): void;
}

export interface Metadatable {
    getMeta: (key: string) => any;
    setMeta: (key: string, value: any) => void;
}

export declare class Npc extends Character implements Serializable {
    area: Area;
    corpseDesc: string;
    defaultEquipment: {[key: string]: string};
    defaultItems: string[];
    description: string;
    id: string;
    keywords: string[];
    quests: string[];
    roomDesc: string;
    script: string;
    shortName: string;
    sourceRoom: Room;
    uuid: string;

    constructor(area, data: NpcDefinition);
    emit(name: string | symbol, ...args: any[]): boolean;
    hydrate(state: GameState): boolean;
    isNpc(): true;
    moveTo(nextRoom: Room, onMoved?: Function): void;
}

export interface NpcClass extends CharacterClass {}

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

export declare class Party extends Set<Player> {
    invited: Set<Player>;
    leader: Player;

    constructor(leader: Player);
    add(member: Player): this;
    delete(member: Player): boolean;
    disband(): void;
    getBroadcastTargets(): Player[];
    invite(target: Player): void;
    isInvited(target: Player): boolean;
    removeInvite(target: Player): void;
}

export declare class Player extends Character implements Broadcastable {
    extraPrompts: Map<string, PromptDefinition>;

    readonly experience: number;
    readonly party: Party;
    readonly prompt: string;
    readonly questTracker: QuestTracker;
    readonly role: PlayerRole;

    constructor();
    addExperience(exp: number): void;
    addPrompt(id: string, renderer: () => string, removeOnRender?: boolean): void;
    deserialize(data: SerializedPlayer, state: GameState): void;
    getBroadcastTargets(): Player[];
    hasPrompt(id: string): boolean;
    interpolatePrompt(promptStr: string, extraData?: SimpleMap): string;
    levelUp(): void;
    moveTo(nextRoom: Room, onMoved?: Function): void;
    queueCommand(command: ExecutableCommand, lag: number): void;
    removePrompt(id: string): void;
    save(callback?: Function): void;
    serialize(): SerializedPlayer;
    setParty(party: Party): void;
    setRole(role: PlayerRole, approver: Player): boolean;
}

export interface PlayerClass extends CharacterClass {
    levelUp(player: Player, newLevel: number): void;
}

export enum PlayerRole {
    PLAYER = 0,
    BUILDER = 1,
    ADMIN = 2,
}

export interface PromptDefinition {
    removeOnRender: boolean;
    renderer: () => string;
}

export declare class Quest extends EventEmitter implements Serializable {
    GameState: GameState;
    completedAt: string;
    config: QuestDefinition;
    id: string;
    entityReference: string;
    goals: QuestGoal[];
    player: Player;
    started: string;
    state: SimpleMap[];

    constructor(state: GameState, id: string, config: QuestDefinition, player: Player);
    addGoal(goal): void;
    complete(): void;
    emit(event: string | symbol, ...args: any[]): boolean;
    getProgress(): {percent: number; display: string};
    hydrate(): void;
    onProgressUpdated(): void;
    serialize(): SerializedQuest;
}

export interface QuestDefinition {
    autoComplete: boolean;
    completionMessage?: string;
    description?: string;
    entityReference?: string;
    goals: QuestGoalDefinition[];
    id: string;
    level?: number;
    npc?: string;
    repeatable: boolean;
    requires?: string[];
    rewards: QuestRewardDefinition[];
    title: string;
}

export declare class QuestGoal extends EventEmitter implements Serializable {
    config: SimpleMap;
    player: Player;
    quest: Quest;
    state: SimpleMap;

    constructor(quest: Quest, config: SimpleMap, player: Player);
    complete(): void;
    getProgress(): {percent: number; display: string};
    hydrate(state: SimpleMap): void;
    serialize(): SerializedQuestGoal;
}

export interface QuestGoalDefinition {
    config: SimpleMap;
    type: string;
}

export interface QuestRewardDefinition {
    config: SimpleMap;
    type: string;
}

export declare class QuestTracker implements Serializable {
    readonly active: Map<string, Quest>;
    readonly completed: Map<string, Quest>;

    constructor(player: Player, active?: any[], completed?: any[]);
    complete(qid: string): void;
    emit(event: string | symbol, ...args: any[]): boolean;
    get(qid: string): Quest;
    hydrate(state: GameState): void;
    isActive(qid: string): boolean;
    isComplete(qid: string): boolean;
    serialize(): SerializedQuestTracker;
    start(quest: Quest): void;
}

export declare class Room extends ScriptableEntity implements Broadcastable {
    area: Area;
    def: RoomDefinition;
    description: string;
    exits: RoomExitDefinition[];
    id: string;
    items: Set<Item>;
    name: string;
    title: string;

    readonly npcs: Set<Npc>;
    readonly players: Set<Player>;

    constructor(def: RoomDefinition, area: Area);
    addItem(item: Item): void;
    addNpc(npc: Npc): void;
    addPlayer(player: Player): void;
    closeDoor(fromRoom?: Room): void;
    emit(eventName: string | symbol, ...args: any[]): boolean;
    findExit(exitName: string): RoomExitDefinition;
    getBroadcastTargets(): Player[];
    getDoor(fromRoom?: Room): Door;
    getExits(): RoomExitDefinition[];
    getExitToRoom(nextRoom: Room): RoomExitDefinition;
    hasDoor(fromRoom): boolean;
    hydrate(state: GameState): void;
    isDoorLocked(fromRoom?: Room): boolean;
    lockDoor(fromRoom?: Room): void;
    openDoor(fromRoom?: Room): void;
    removeItem(item: Item): void;
    removeNpc(npc: Npc, removeSpawn?: boolean): void;
    removePlayer(player: Player): void;
    spawnItem(state: GameState, entityRef: string): Item;
    spawnNpc(state: GameState, entityRef: string): Npc;
    unlockDoor(fromRoom?: Room): void;
}

export interface RoomDefinition extends ScriptableEntityDefinition {
    description: string;
    doors?: {[key: string]: Door};
    exits?: RoomExitDefinition[];
    id: string;
    items?: RoomEntityDefinition[];
    npcs?: RoomEntityDefinition[];
    title: string;
    // @TODO: should this be an enum?
    type?: string;
}

export interface RoomEntityDefinition {
    id: string;
    maxLoad?: number;
    replaceOnRespawn?: boolean;
    respawnChance?: number;
}

export interface RoomExitDefinition {
    // @TODO: make directions an enum
    direction: string;
    leaveMessage?: string;
    roomId: string;
}

export interface Scriptable {
    behaviors: Map<string, SimpleMap | true>;
    emit: (name: string | symbol, ...args: any[]) => boolean;
    getBehavior: (name: string) => SimpleMap | true;
    hasBehavior: (name: string) => boolean;
}

export interface ScriptableEntityDefinition extends GameEntityDefinition {
    behaviors?: {[key: string]: SimpleMap | true};
    script?: string;
}

export interface SerializedGameEntity {
    entityReference?: string;
    metadata?: SimpleMap;
}

export interface SerializedScriptableEntity extends SerializedGameEntity {
    behaviors: {[key: string]: SimpleMap | true};
}

export interface Scriptable {
    behaviors: Map<string, SimpleMap | true>;
    emit: (name: string | symbol, ...args: any[]) => boolean;
    getBehavior: (name: string) => SimpleMap | true;
    hasBehavior: (name: string) => boolean;
}

export declare class ScriptableEntity extends GameEntity implements Scriptable, Serializable {
    readonly behaviors: Map<string, SimpleMap | true>;

    constructor(def?: ScriptableEntityDefinition);
    emit(name: string | symbol, ...args: any[]): boolean;
    getBehavior(name: string): SimpleMap | true;
    hasBehavior(name: string): boolean;
    hydrate(state: GameState): void;
    serialize(): SerializedScriptableEntity;
}

export interface ScriptableEntityDefinition extends GameEntityDefinition {
    behaviors?: {[key: string]: SimpleMap | true};
    script?: string;
}

export interface Serializable {
    serialize(): SimpleMap | SimpleMap[];
}

export interface SerializedAttribute extends SimpleMap {
    base: number;
    delta?: number;
}

export interface SerializedCharacter extends SerializedScriptableEntity {
    attributes: SerializedCharacterAttributes;
    level: number;
    name: string;
    room: string;
}

export interface SerializedCharacterAttributes extends SimpleMap {
    [key: string]: SerializedAttribute;
}

export interface SerializedEffect extends SimpleMap {
    ability?: string;
    config: EffectConfig;
    elapsed: number;
    id: string;
    remaining: number;
    state: EffectState;
}

export interface SerializedInventory extends SimpleMap {
    [key: string]: SerializedItem;
}

export interface SerializedItem extends SerializedScriptableEntity {
    uuid: string;
}

export interface SerializedPlayer extends SerializedCharacter {
    experience: number;
    prompt: string;
    role: PlayerRole;
}

export interface SerializedQuest extends SimpleMap {
    config: {desc: string; level: number; title: string};
    progress: {percent: number; display: string};
    state: SerializedQuestGoal[];
}

export interface SerializedQuestGoal extends SimpleMap {
    config: SimpleMap;
    state: SimpleMap;
}

export interface SerializedQuestTracker extends SimpleMap {
    active: {[key: string]: SerializedQuest};
    completed: {[key: string]: SerializedQuest};
}

export interface SerializedScriptableEntity extends SerializedGameEntity {
    behaviors: {[key: string]: SimpleMap | true};
}

export interface SimpleMap {
    [key: string]: any;
}

export declare abstract class TransportStream<T extends EventEmitter> extends EventEmitter {
    _prompted: boolean;
    socket: T;

    readonly readable: boolean;
    readonly writable: boolean;

    abstract address(): AddressInfo | string;
    abstract end(): void;
    abstract destroy(): void;
    abstract pause(): this;
    abstract resume(): this;
    abstract setEncoding(): this;
    abstract write(message: string, encoding?: string): boolean;
    attach(socket: T): void;
    command(command: string, ...args: any[]): any;
}
