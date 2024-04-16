/* eslint-disable import/max-dependencies */
import { type EventEmitter } from 'events';

import { type Command } from 'commander';

import AbilityManager from './abilities/ability-manager.js';
import AttributeFactory from './attributes/attribute-factory.js';
import BehaviorManager from './behaviors/behavior-manager.js';
import CharacterClassManager from './classes/character-class-manager.js';
import ItemFactory from './equipment/item-factory.js';
import ItemManager from './equipment/item-manager.js';
import MobFactory from './mobs/mob-factory.js';
import MobManager from './mobs/mob-manager.js';
import MudEventManager from './events/mud-event-manager.js';
import PlayerManager from './players/player-manager.js';
import QuestFactory from './quests/quest-factory.js';
import QuestGoalManager from './quests/quest-goal-manager.js';
import QuestRewardManager from './quests/quest-reward-manager.js';
import RoomFactory from './locations/room-factory.js';
import RoomManager from './locations/room-manager.js';
import StreamEventManager from './events/stream-event-manager.js';
import { UpdateTickEvent } from './common/events/index.js';

import type CombatEngine from './combat/combat-engine.js';
import CommandManager from './commands/command-manager.js';
import ChannelManager from './communication/channels/channel-manager.js';
import type Timeout from './util/timeout.js';
import type TransportStream from './communication/transport-stream.js';
import EffectFactory from './effects/effect-factory.js';
import GameServer from './game-server.js';
import type GameStateData from './game-state-data.js';
import PartyManager from './groups/party-manager.js';
import HelpManager from './help/help-manager.js';
import AreaFactory from './locations/area-factory.js';
import AreaManager from './locations/area-manager.js';
import AccountManager from './players/account-manager.js';
import type Config from './util/config.js';
import Data from './util/data.js';

const DEFAULT_TICK_FREQUENCY = 100;

export class GameState implements GameStateData {
    /* eslint-disable-next-line no-undef */
    [key: string]: unknown;

    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _accountManager: AccountManager;
    private readonly _areaBehaviorManager: BehaviorManager =
        new BehaviorManager();
    private readonly _areaFactory: AreaFactory = new AreaFactory();
    private readonly _areaManager: AreaManager;
    private readonly _attributeFactory: AttributeFactory =
        new AttributeFactory();
    private readonly _channelManager: ChannelManager = new ChannelManager();
    private readonly _commandManager: CommandManager = new CommandManager();
    private readonly _config: Config;
    private readonly _effectFactory: EffectFactory = new EffectFactory();
    private readonly _helpManager: HelpManager = new HelpManager();
    private readonly _itemBehaviorManager: BehaviorManager =
        new BehaviorManager();
    private readonly _itemManager: ItemManager = new ItemManager();
    private readonly _itemFactory: ItemFactory = new ItemFactory();
    private readonly _mobBehaviorManager: BehaviorManager =
        new BehaviorManager();
    private readonly _mobFactory: MobFactory = new MobFactory();
    private readonly _mobManager: MobManager = new MobManager();
    private readonly _npcClassManager: CharacterClassManager =
        new CharacterClassManager();
    private readonly _partyManager: PartyManager = new PartyManager();
    private readonly _playerClassManager: CharacterClassManager =
        new CharacterClassManager();
    private readonly _playerManager: PlayerManager;
    private readonly _questFactory: QuestFactory = new QuestFactory();
    private readonly _questGoalManager: QuestGoalManager =
        new QuestGoalManager();
    private readonly _questRewardManager: QuestRewardManager =
        new QuestRewardManager();
    private readonly _roomBehaviorManager: BehaviorManager =
        new BehaviorManager();
    private readonly _roomFactory: RoomFactory = new RoomFactory();
    private readonly _roomManager: RoomManager = new RoomManager();
    private readonly _server: GameServer = new GameServer();
    private readonly _serverEventManager: MudEventManager =
        new MudEventManager();
    private readonly _skillManager: AbilityManager = new AbilityManager();
    private readonly _spellManager: AbilityManager = new AbilityManager();
    private readonly _streamEventManager: StreamEventManager =
        new StreamEventManager();

    private _combat: CombatEngine | null = null;
    private _entityTickInterval: Timeout | null = null;
    private _playerTickInterval: Timeout | null = null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(config: Config) {
        Data.setDataPath(config.getPath('data'));

        this._accountManager = new AccountManager(this);
        this._areaManager = new AreaManager(this);
        this._config = config;
        this._playerManager = new PlayerManager(this);
    }

    private _attachServer(): void {
        this.serverEventManager.attach(this._server);
    }

    private _startEntityTicker(): void {
        if (this._entityTickInterval !== null) {
            clearInterval(this._entityTickInterval);
        }

        this._entityTickInterval = setInterval(
            () => this.tickEntities(),
            this._config.get<number>(
                'entityTickFrequency',
                DEFAULT_TICK_FREQUENCY
            )!
        );
    }

    private _startPlayerTicker(): void {
        if (this._playerTickInterval !== null) {
            clearInterval(this._playerTickInterval);
        }

        this._playerTickInterval = setInterval(
            () => this.tickPlayers(),
            this._config.get<number>(
                'playerTickFrequency',
                DEFAULT_TICK_FREQUENCY
            )!
        );
    }

    public get accountManager(): AccountManager {
        return this._accountManager;
    }

    public get areaBehaviorManager(): BehaviorManager {
        return this._areaBehaviorManager;
    }

    public get areaFactory(): AreaFactory {
        return this._areaFactory;
    }

    public get areaManager(): AreaManager {
        return this._areaManager;
    }

    public get attributeFactory(): AttributeFactory {
        return this._attributeFactory;
    }

    public get channelManager(): ChannelManager {
        return this._channelManager;
    }

    public get combat(): CombatEngine | null {
        return this._combat;
    }

    public get commandManager(): CommandManager {
        return this._commandManager;
    }

    public get config(): Config {
        return this._config;
    }

    public get effectFactory(): EffectFactory {
        return this._effectFactory;
    }

    public get helpManager(): HelpManager {
        return this._helpManager;
    }

    public get itemBehaviorManager(): BehaviorManager {
        return this._itemBehaviorManager;
    }

    public get itemFactory(): ItemFactory {
        return this._itemFactory;
    }

    public get itemManager(): ItemManager {
        return this._itemManager;
    }

    public get mobBehaviorManager(): BehaviorManager {
        return this._mobBehaviorManager;
    }

    public get mobFactory(): MobFactory {
        return this._mobFactory;
    }

    public get mobManager(): MobManager {
        return this._mobManager;
    }

    public get npcClassManager(): CharacterClassManager {
        return this._npcClassManager;
    }

    public get partyManager(): PartyManager {
        return this._partyManager;
    }

    public get playerClassManager(): CharacterClassManager {
        return this._playerClassManager;
    }

    public get playerManager(): PlayerManager {
        return this._playerManager;
    }

    public get questFactory(): QuestFactory {
        return this._questFactory;
    }

    public get questGoalManager(): QuestGoalManager {
        return this._questGoalManager;
    }

    public get questRewardManager(): QuestRewardManager {
        return this._questRewardManager;
    }

    public get roomBehaviorManager(): BehaviorManager {
        return this._roomBehaviorManager;
    }

    public get roomFactory(): RoomFactory {
        return this._roomFactory;
    }

    public get roomManager(): RoomManager {
        return this._roomManager;
    }

    public get serverEventManager(): MudEventManager {
        return this._serverEventManager;
    }

    public get skillManager(): AbilityManager {
        return this._skillManager;
    }

    public get spellManager(): AbilityManager {
        return this._spellManager;
    }

    public get streamEventManager(): StreamEventManager {
        return this._streamEventManager;
    }

    public attachServerStream<
        S extends TransportStream<T>,
        T extends EventEmitter,
    >(stream: S): void {
        this._streamEventManager.attach(stream);
    }

    public setCombatEngine(engine: CombatEngine): void {
        this._combat = engine;
    }

    public startServer(commander: Command): void {
        this._attachServer();

        this._server.startup(commander);

        this._startEntityTicker();
        this._startPlayerTicker();
    }

    public tickEntities(): void {
        this._areaManager.dispatch(new UpdateTickEvent());
    }

    public tickPlayers(): void {
        this._playerManager.dispatch(new UpdateTickEvent());
    }
}

export default GameState;
