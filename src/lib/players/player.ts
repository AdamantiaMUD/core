import Account from './account';
import Character from '../entities/character';
import CommandQueue, {ExecutableCommand} from '../commands/command-queue';
import PlayerRole from './player-role';
import {Broadcastable} from '../communication/broadcast';
import {SimpleMap} from '../../../index';

export interface PromptDefinition {
    removeOnRender: boolean;
    renderer: () => string;
}

export class Player extends Character implements Broadcastable {
    private readonly _commandQueue: CommandQueue = new CommandQueue();
    private readonly _role: PlayerRole;

    public account: Account;
    public extraPrompts: Map<string, PromptDefinition> = new Map();
    public name: string;
    public prompt: string = '> ';

    public constructor(data: any = {}) {
        super(data);

        this._role = data.role || PlayerRole.PLAYER;
    }

    public get commandQueue(): CommandQueue {
        return this._commandQueue;
    }

    public get role(): PlayerRole {
        return this._role;
    }

    /**
     * Add a line of text to be displayed immediately after the prompt when the
     * prompt is displayed
     */
    public addPrompt(id: string, renderer: () => string, removeOnRender: boolean = false): void {
        this.extraPrompts.set(id, {removeOnRender, renderer});
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
    public interpolatePrompt(promptStr: string, extraData = {}): string {
        const attributeData = {};

        // for (const [attr] of this.attributes) {
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

    /**
     * @see CommandQueue::enqueue
     */
    public queueCommand(command: ExecutableCommand, lag: number): void {
        const index = this.commandQueue.enqueue(command, lag);

        this.emit('commandQueued', index);
    }

    public removePrompt(id: string): void {
        this.extraPrompts.delete(id);
    }

    public serialize(): SimpleMap {
        const data: SimpleMap = {
            ...super.serialize(),
        };

        return data;
    }
}

export default Player;
