import Broadcast from '../broadcast.js';
import PartyAudience from '../audiences/party-audience.js';
import Player from '../../players/player.js';
import PrivateAudience from '../audiences/private-audience.js';
import WorldAudience from '../audiences/world-audience.js';
import { ChannelReceiveEvent } from './events/index.js';
import {
    NoMessageError,
    NoPartyError,
    NoRecipientError,
} from './errors/index.js';
import { cast, hasValue } from '../../util/functions.js';

import type Broadcastable from '../broadcastable.js';
import type ChannelAudience from '../audiences/channel-audience.js';
import type ChannelDefinition from './channel-definition.js';
import type ChannelMessageFormatter from './channel-message-formatter.js';
import type Character from '../../characters/character.js';
import type GameStateData from '../../game-state-data.js';
import type PlayerRole from '../../players/player-role.js';
import type { Colorizer } from '../colorizer.js';

const { sayAt, sayAtFormatted } = Broadcast;

/**
 * @property {ChannelAudience} audience People who receive messages from this
 *                                      channel
 * @property {string} color Default color. This is purely a helper if you're
 *                          using default format methods
 * @property {PlayerRole} minRequiredRole If set only players with the given
 *                                        role or greater can use the channel
 * @property {{sender: function, target: function}} [formatter]
 */
export class Channel {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public aliases: string[];
    public audience: ChannelAudience;
    public bundle: string | null;
    public color: string[] | string | null;
    public description: string | null;
    public formatter: {
        sender: ChannelMessageFormatter;
        target: ChannelMessageFormatter;
    };
    public minRequiredRole: PlayerRole | null;
    public name: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    /**
     * @param {Object}  config
     * @param {string} [config.description]
     * @param {PlayerRole} [config.minRequiredRole]
     * @param {string} [config.color]
     * @param {{sender: function, target: function}} [config.formatter]
     */
    public constructor(config: ChannelDefinition) {
        if (!hasValue(config.name)) {
            throw new Error('Channels must have a name to be usable.');
        }

        this.name = config.name;
        this.description = config.description ?? null;

        this.minRequiredRole =
            typeof config.minRequiredRole === 'undefined'
                ? null
                : config.minRequiredRole;

        // for debugging purposes, which bundle it came from
        this.bundle = config.bundle ?? null;
        this.audience = config.audience ?? new WorldAudience();
        this.color = config.color ?? null;
        this.aliases = config.aliases ?? [];
        this.formatter = config.formatter ?? {
            sender: this.formatToSender.bind(this),
            target: this.formatToRecipient.bind(this),
        };
    }

    public colorify(message: string): string {
        if (!hasValue(this.color)) {
            return message;
        }

        const colors = Array.isArray(this.color) ? this.color : [this.color];

        let open = '',
            close = '';

        for (const color of colors) {
            open += `{${color} `;
            close += '}';
        }

        return open + message + close;
    }

    public describeSelf(sender: Character): void {
        if (sender instanceof Player) {
            sayAt(sender, `Channel: ${this.name}`);
            sayAt(sender, `Syntax: ${this.getUsage()}`);

            if (hasValue(this.description)) {
                sayAt(sender, this.description);
            }
        }
    }

    /**
     * How to render the message to everyone else
     * E.g., you may want "chat" to say "Playername chats, 'message here'"
     * @param {Player} sender
     * @param {Player} target
     * @param {string} message
     * @param {Function} colorify
     * @returns {string}
     */
    public formatToRecipient(
        sender: Character,
        target: Broadcastable | null,
        message: string,
        colorify: Colorizer
    ): string {
        return colorify(`[${this.name}] ${sender.name}: ${message}`);
    }

    /**
     * How to render the message the player just sent to the channel
     * E.g., you may want "chat" to say "You chat, 'message here'"
     */
    public formatToSender(
        sender: Character,
        target: Broadcastable | null,
        message: string,
        colorify: Colorizer
    ): string {
        return colorify(`[${this.name}] You: ${message}`);
    }

    public getUsage(): string {
        if (this.audience instanceof PrivateAudience) {
            return `${this.name} <target> [message]`;
        }

        return `${this.name} [message]`;
    }

    /**
     * @param {GameState} state
     * @param {Player}    sender
     * @param {string}    msg
     * @fires ScriptableEntity#channelReceive
     */
    public send(state: GameStateData, sender: Character, msg: string): void {
        // If they don't include a message, explain how to use the channel.
        if (msg.length === 0) {
            throw new NoMessageError();
        }

        if (!hasValue(this.audience)) {
            throw new Error(`Channel [${this.name} has invalid audience`);
        }

        let message = msg;

        this.audience.configure({ state, sender, message });
        const targets = this.audience.getBroadcastTargets();

        if (this.audience instanceof PartyAudience && targets.length === 0) {
            throw new NoPartyError();
        }

        // Allow audience to change message e.g., strip target name.
        message = this.audience.alterMessage(message);

        // Private channels also send the target player to the formatter
        if (sender instanceof Player) {
            if (this.audience instanceof PrivateAudience) {
                if (targets.length === 0) {
                    throw new NoRecipientError();
                }
                sayAt(
                    sender,
                    this.formatter.sender(
                        sender,
                        targets[0],
                        message,
                        this.colorify.bind(this)
                    )
                );
            } else {
                sayAt(
                    sender,
                    this.formatter.sender(
                        sender,
                        null,
                        message,
                        this.colorify.bind(this)
                    )
                );
            }
        }

        // send to audience targets
        sayAtFormatted(
            this.audience,
            message,
            (target: Broadcastable, mess: string) =>
                this.formatter.target(
                    sender,
                    target,
                    mess,
                    this.colorify.bind(this)
                )
        );

        // strip color tags
        const rawMessage = message.replace(/<\/?\w+?>/gmu, '');

        for (const target of targets) {
            /**
             * Docs limit this to be for ScriptableEntity (Area/Room/Item), but
             * also applies to NPC and Player
             */
            cast<Character>(target).dispatch(
                new ChannelReceiveEvent({
                    channel: this,
                    message: rawMessage,
                    sender: sender,
                })
            );
        }
    }
}

export default Channel;
