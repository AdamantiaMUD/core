import get from 'lodash.get';

import Broadcast from '../communication/broadcast.js';
import Character from '../characters/character.js';
import Inventory from '../equipment/inventory.js';
import { isNpc } from '../util/characters.js';
import PlayerRole from './player-role.js';
import QuestTracker from '../quests/quest-tracker.js';
import {
    PlayerCommandQueuedEvent,
    PlayerEnterRoomEvent,
    PlayerSaveEvent,
} from './events/index.js';
import {
    RoomPlayerEnterEvent,
    RoomPlayerLeaveEvent,
} from '../locations/events/index.js';
import { hasValue, noop } from '../util/functions.js';

import type Broadcastable from '../communication/broadcastable.js';
import type GameStateData from '../game-state-data.js';
import type Party from '../groups/party.js';
import type PromptDefinition from '../communication/prompt-definition.js';
import type Room from '../locations/room.js';
import type SerializedPlayer from './serialized-player.js';
import type SimpleMap from '../util/simple-map.js';
import type { ExecutableCommand } from '../commands/command-queue.js';

const DEFAULT_MAX_INVENTORY = 20;

export class Player extends Character implements Broadcastable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private _experience: number = 0;
    private _party: Party | null = null;
    private _prompt: string = '> ';
    private _role: PlayerRole = PlayerRole.PLAYER;

    private readonly _questTracker: QuestTracker;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public extraPrompts: Map<string, PromptDefinition> = new Map<
        string,
        PromptDefinition
    >();

    public constructor() {
        super();

        this._questTracker = new QuestTracker(this);
    }

    public get experience(): number {
        return this._experience;
    }

    public get inventory(): Inventory {
        if (this._inventory === null) {
            this._inventory = new Inventory();

            if (!isNpc(this) && !isFinite(this._inventory.getMax())) {
                const maxInv =
                    this._state?.config.get<number>(
                        'maxPlayerInventory',
                        DEFAULT_MAX_INVENTORY
                    ) ?? DEFAULT_MAX_INVENTORY;

                this._inventory.setMax(maxInv);
            }
        }

        return this._inventory;
    }

    public get party(): Party | null {
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
    public addPrompt(
        id: string,
        renderer: () => string,
        removeOnRender: boolean = false
    ): void {
        this.extraPrompts.set(id, { removeOnRender, renderer });
    }

    public deserialize(data: SerializedPlayer, state: GameStateData): void {
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
    public interpolatePrompt(
        promptStr: string,
        extraData: SimpleMap = {}
    ): string {
        const attributeData = {};

        /*
         * for (const attr of this.getAttributeNames()) {
         *     attributeData[attr] = {
         *         current: this.getAttribute(attr),
         *         max: this.getMaxAttribute(attr),
         *         base: this.getBaseAttribute(attr),
         *     };
         * }
         */

        const promptData: SimpleMap = Object.assign(attributeData, extraData);

        const expr = /%(?<token>[a-z.]+)%/u;

        let prompt = promptStr,
            matches = expr.exec(prompt);

        while (matches !== null) {
            const token = matches[1];

            /* eslint-disable-next-line @typescript-eslint/no-unsafe-call -- eslint thinks `get` is type `any`, but it isn't... wth */
            let promptValue: string = get(promptData, token) as string;

            if (!hasValue(promptValue)) {
                promptValue = 'invalid-token';
            }

            prompt = prompt.replace(matches[0], promptValue);
            matches = expr.exec(prompt);
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
    public moveTo(nextRoom: Room, onMoved: () => void = noop): void {
        const prevRoom = this.room;

        if (hasValue(this.room) && this.room !== nextRoom) {
            this.room.dispatch(
                new RoomPlayerLeaveEvent({ player: this, nextRoom: nextRoom })
            );
            this.room.removePlayer(this);
        }

        this.setRoom(nextRoom);
        nextRoom.addPlayer(this);

        onMoved();

        nextRoom.dispatch(
            new RoomPlayerEnterEvent({ player: this, prevRoom: prevRoom })
        );

        this.dispatch(new PlayerEnterRoomEvent({ room: nextRoom }));
    }

    /**
     * @see CommandQueue::enqueue
     */
    public queueCommand(command: ExecutableCommand, lag: number): void {
        const idx = this.commandQueue.enqueue(command, lag);

        this.dispatch(new PlayerCommandQueuedEvent({ idx }));
    }

    public removePrompt(id: string): void {
        this.extraPrompts.delete(id);
    }

    public save(callback: () => void = noop): void {
        if (!this.__hydrated) {
            return;
        }

        this.dispatch(new PlayerSaveEvent({ callback }));
    }

    public serialize(): SerializedPlayer {
        return {
            ...super.serialize(),

            experience: this._experience,
            prompt: this._prompt,
            role: this._role,
        };
    }

    public setName(name: string): void {
        this._name = name;
    }

    public setParty(party: Party | null): void {
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
