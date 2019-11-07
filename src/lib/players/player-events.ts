import Character from '../characters/character';
import Item from '../equipment/item';
import Quest, {QuestProgress} from '../quests/quest';
import Room, {RoomExitDefinition} from '../locations/room';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface PlayerCommandQueuedPayload {
    idx: number;
}

export const PlayerCommandQueuedEvent: MudEventConstructor<PlayerCommandQueuedPayload> = class extends MudEvent<PlayerCommandQueuedPayload> {
    public NAME: string = 'command-queued';
    public idx: number;
};

export interface PlayerCurrencyGainedPayload {
    amount: number;
    denomination: string;
}

export const PlayerCurrencyGainedEvent: MudEventConstructor<PlayerCurrencyGainedPayload> = class extends MudEvent<PlayerCurrencyGainedPayload> {
    public NAME: string = 'currency-gained';
    public amount: number;
    public denomination: string;
};

export interface PlayerDropItemPayload {
    item: Item;
}

export const PlayerDropItemEvent: MudEventConstructor<PlayerDropItemPayload> = class extends MudEvent<PlayerDropItemPayload> {
    public NAME: string = 'drop';
    public item: Item;
};

export interface PlayerEnterRoomPayload {
    room: Room;
}

export const PlayerEnterRoomEvent: MudEventConstructor<PlayerEnterRoomPayload> = class extends MudEvent<PlayerEnterRoomPayload> {
    public NAME: string = 'enter-room';
    public room: Room;
};

export interface PlayerExperiencePayload {
    amount: number;
}

export const PlayerExperienceEvent: MudEventConstructor<PlayerExperiencePayload> = class extends MudEvent<PlayerExperiencePayload> {
    public NAME: string = 'experience';
    public amount: number;
};

export interface PlayerGetItemPayload {
    item: Item;
}

export const PlayerGetItemEvent: MudEventConstructor<PlayerGetItemPayload> = class extends MudEvent<PlayerGetItemPayload> {
    public NAME: string = 'get';
    public item: Item;
};

export interface PlayerKilledPayload {
    killer?: Character;
}

export const PlayerKilledEvent: MudEventConstructor<PlayerKilledPayload> = class extends MudEvent<PlayerKilledPayload> {
    public NAME: string = 'player-killed';
    public killer?: Character;
};

export const PlayerLevelUpEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public NAME: string = 'level-up';
};

export const PlayerLoginEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public NAME: string = 'login';
};

export interface PlayerMovePayload {
    roomExit: RoomExitDefinition;
}

export const PlayerMoveEvent: MudEventConstructor<PlayerMovePayload> = class extends MudEvent<PlayerMovePayload> {
    public NAME: string = 'move';
    public roomExit: RoomExitDefinition;
};

export interface PlayerQuestCompletedPayload {
    quest: Quest;
}

export const PlayerQuestCompletedEvent: MudEventConstructor<PlayerQuestCompletedPayload> = class extends MudEvent<PlayerQuestCompletedPayload> {
    public NAME: string = 'quest-complete';
    public quest: Quest;
};

export interface PlayerQuestProgressPayload {
    progress: QuestProgress;
    quest: Quest;
}

export const PlayerQuestProgressEvent: MudEventConstructor<PlayerQuestProgressPayload> = class extends MudEvent<PlayerQuestProgressPayload> {
    public NAME: string = 'quest-progress';
    public progress: QuestProgress;
    public quest: Quest;
};

export interface PlayerQuestStartedPayload {
    quest: Quest;
}

export const PlayerQuestStartedEvent: MudEventConstructor<PlayerQuestStartedPayload> = class extends MudEvent<PlayerQuestStartedPayload> {
    public NAME: string = 'quest-start';
    public quest: Quest;
};

export interface PlayerQuestTurnInReadyPayload {
    quest: Quest;
}

export const PlayerQuestTurnInReadyEvent: MudEventConstructor<PlayerQuestTurnInReadyPayload> = class extends MudEvent<PlayerQuestTurnInReadyPayload> {
    public NAME: string = 'quest-turn-in-ready';
    public quest: Quest;
};

export interface PlayerSavePayload {
    callback?: Function;
}

export const PlayerSaveEvent: MudEventConstructor<PlayerSavePayload> = class extends MudEvent<PlayerSavePayload> {
    public NAME: string = 'save';
    public callback?: Function;
};

export const PlayerSavedEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public NAME: string = 'saved';
};
