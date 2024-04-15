/* eslint-disable import/max-dependencies */
import type AbilityManager from './abilities/ability-manager.js';
import type AccountManager from './players/account-manager.js';
import type AreaFactory from './locations/area-factory.js';
import type AreaManager from './locations/area-manager.js';
import type AttributeFactory from './attributes/attribute-factory.js';
import type BehaviorManager from './behaviors/behavior-manager.js';
import type ChannelManager from './communication/channels/channel-manager.js';
import type CharacterClassManager from './classes/character-class-manager.js';
import type CombatEngine from './combat/combat-engine.js';
import type CommandManager from './commands/command-manager.js';
import type Config from './util/config.js';
import type EffectFactory from './effects/effect-factory.js';
import type HelpManager from './help/help-manager.js';
import type ItemFactory from './equipment/item-factory.js';
import type ItemManager from './equipment/item-manager.js';
import type MobFactory from './mobs/mob-factory.js';
import type MobManager from './mobs/mob-manager.js';
import type MudEventManager from './events/mud-event-manager.js';
import type PartyManager from './groups/party-manager.js';
import type PlayerManager from './players/player-manager.js';
import type QuestFactory from './quests/quest-factory.js';
import type QuestGoalManager from './quests/quest-goal-manager.js';
import type QuestRewardManager from './quests/quest-reward-manager.js';
import type RoomFactory from './locations/room-factory.js';
import type RoomManager from './locations/room-manager.js';
import type SimpleMap from './util/simple-map.js';
import type StreamEventManager from './events/stream-event-manager.js';

export interface GameStateData extends SimpleMap {
    accountManager: AccountManager;
    areaBehaviorManager: BehaviorManager;
    areaFactory: AreaFactory;
    areaManager: AreaManager;
    attributeFactory: AttributeFactory;
    channelManager: ChannelManager;
    combat: CombatEngine | null;
    commandManager: CommandManager;
    config: Config;
    effectFactory: EffectFactory;
    helpManager: HelpManager;
    itemBehaviorManager: BehaviorManager;
    itemManager: ItemManager;
    itemFactory: ItemFactory;
    mobBehaviorManager: BehaviorManager;
    mobFactory: MobFactory;
    mobManager: MobManager;
    npcClassManager: CharacterClassManager;
    partyManager: PartyManager;
    playerClassManager: CharacterClassManager;
    playerManager: PlayerManager;
    questFactory: QuestFactory;
    questGoalManager: QuestGoalManager;
    questRewardManager: QuestRewardManager;
    roomBehaviorManager: BehaviorManager;
    roomFactory: RoomFactory;
    roomManager: RoomManager;
    serverEventManager: MudEventManager;
    skillManager: AbilityManager;
    spellManager: AbilityManager;
    streamEventManager: StreamEventManager;
}

export default GameStateData;
