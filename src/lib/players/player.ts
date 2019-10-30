import Broadcast from '../communication/broadcast';
import Character, {SerializedCharacter} from '../characters/character';
import GameState from '../game-state';
import Party from '../groups/party';
import PlayerRole from './player-role';
import QuestTracker from '../quests/quest-tracker';
import Room from '../locations/room';
import SimpleMap from '../util/simple-map';
import {Broadcastable} from '../communication/broadcast';
import {ExecutableCommand} from '../commands/command-queue';
import {PlayerCommandQueuedEvent, PlayerEnterRoomEvent, PlayerSaveEvent} from './player-events';
import {RoomPlayerEnterEvent, RoomPlayerLeaveEvent} from '../locations/room-events';
import {noop} from '../util/functions';

export interface PromptDefinition {
    removeOnRender: boolean;
    renderer: () => string;
}

export interface SerializedPlayer extends SerializedCharacter {
    experience: number;
    prompt: string;
    role: PlayerRole;
}

export class Player extends Character implements Broadcastable {
    private _experience: number = 0;
    private _party: Party = null;
    private _prompt: string = '> ';
    private readonly _questTracker: QuestTracker;
    private _role: PlayerRole = PlayerRole.PLAYER;

    public extraPrompts: Map<string, PromptDefinition> = new Map();

    public constructor() {
        super();

        this._questTracker = new QuestTracker(this);
    }

    public get experience(): number {
        return this._experience;
    }

    public get party(): Party {
        return this._party;
    }

    public get prompt(): string {
        return this._prompt;
    }

    public get questTracker(): QuestTracker {
        return this._questTracker;
    }

    public get role(): PlayerRole {
        return this._role;
    }

    public addExperience(exp: number): void {
        this._experience += exp;
    }

    /**
     * Add a line of text to be displayed immediately after the prompt when the
     * prompt is displayed
     */
    public addPrompt(id: string, renderer: () => string, removeOnRender: boolean = false): void {
        this.extraPrompts.set(id, {removeOnRender, renderer});
    }

    public deserialize(data: SerializedPlayer, state: GameState): void {
        super.deserialize(data, state);

        this._experience = data.experience;
        this._prompt = data.prompt;
        this._role = data.role;

        this.__hydrated = true;
    }

    public getBroadcastTargets(): Player[] {
        return [this];
    }

    public hasPrompt(id: string): boolean {
        return this.extraPrompts.has(id);
    }

    /**
     * Convert prompt tokens into actual data
     */
    public interpolatePrompt(promptStr: string, extraData: SimpleMap = {}): string {
        const attributeData = {};

        // for (const attr of this.getAttributeNames()) {
        //     attributeData[attr] = {
        //         current: this.getAttribute(attr),
        //         max: this.getMaxAttribute(attr),
        //         base: this.getBaseAttribute(attr),
        //     };
        // }

        const promptData = Object.assign(attributeData, extraData);

        const expr = /%([a-z.]+)%/u;

        let prompt = promptStr,
            matches = prompt.match(expr);

        while (matches !== null) {
            const token = matches[1];

            let promptValue = token
                .split('.')
                .reduce((obj, index) => obj && obj[index], promptData);

            if (promptValue === null || promptValue === undefined) {
                promptValue = 'invalid-token';
            }

            prompt = prompt.replace(matches[0], promptValue);
            matches = prompt.match(expr);
        }

        return prompt;
    }

    public levelUp(): void {
        this._level += 1;
        this._experience = 0;
    }

    /**
     * Move the player to the given room, emitting events appropriately
     */
    public moveTo(nextRoom: Room, onMoved: Function = noop): void {
        const prevRoom = this.room;

        if (this.room && this.room !== nextRoom) {
            this.room.dispatch(new RoomPlayerLeaveEvent({player: this, nextRoom: nextRoom}));
            this.room.removePlayer(this);
        }

        this.room = nextRoom;
        nextRoom.addPlayer(this);

        onMoved();

        nextRoom.dispatch(new RoomPlayerEnterEvent({player: this, prevRoom: prevRoom}));

        this.dispatch(new PlayerEnterRoomEvent({room: nextRoom}));
    }

    /**
     * @see CommandQueue::enqueue
     */
    public queueCommand(command: ExecutableCommand, lag: number): void {
        const idx = this.commandQueue.enqueue(command, lag);

        this.dispatch(new PlayerCommandQueuedEvent({idx}));
    }

    public removePrompt(id: string): void {
        this.extraPrompts.delete(id);
    }

    public save(callback?: Function): void {
        if (!this.__hydrated) {
            return;
        }

        this.dispatch(new PlayerSaveEvent({callback}));
    }

    public serialize(): SerializedPlayer {
        return {
            ...super.serialize(),

            experience: this._experience,
            prompt: this._prompt,
            role: this._role,
        };
    }

    public setParty(party: Party): void {
        this._party = party;
    }

    public setRole(role: PlayerRole, approver: Player): boolean {
        if (approver.role !== PlayerRole.ADMIN) {
            Broadcast.sayAt(approver, "You can't change other players' roles!");

            return false;
        }

        this._role = role;

        return true;
    }
}

export default Player;
