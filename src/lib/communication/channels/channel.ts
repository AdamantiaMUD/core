import Broadcast from '../broadcast';
import ChannelAudience from '../audiences/channel-audience';
import Character from '../../characters/character';
import GameState from '../../game-state';
import PartyAudience from '../audiences/party-audience';
import Player from '../../players/player';
import PlayerRole from '../../players/player-role';
import PrivateAudience from '../audiences/private-audience';
import WorldAudience from '../audiences/world-audience';
import {ChannelReceiveEvent} from './channel-events';
import {NoMessageError, NoPartyError, NoRecipientError} from './channel-errors';

const {sayAt, sayAtFormatted} = Broadcast;

export interface ChannelDefinition {
    aliases?: string[];
    audience: ChannelAudience;
    bundle?: string;
    color?: string | string[];
    description?: string;
    formatter?: {
        sender: (
            sender: Player,
            target: Player,
            message: string,
            colorify: (message: string) => string
        ) => string;
        target: (
            sender: Player,
            target: Player,
            message: string,
            colorify: (message: string) => string
        ) => string;
    };
    minRequiredRole?: PlayerRole;
    name: string;
}

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
    /* eslint-disable lines-between-class-members */
    public aliases: string[];
    public audience: ChannelAudience;
    public bundle: string;
    public color: string | string[];
    public description: string;
    public formatter: {sender: Function; target: Function};
    public minRequiredRole: PlayerRole;
    public name: string;
    /* eslint-enable lines-between-class-members */

    /**
     * @param {Object}  config
     * @param {string} [config.description]
     * @param {PlayerRole} [config.minRequiredRole]
     * @param {string} [config.color]
     * @param {{sender: function, target: function}} [config.formatter]
     */
    public constructor(config: ChannelDefinition) {
        if (!config.name) {
            throw new Error('Channels must have a name to be usable.');
        }
        if (!config.audience) {
            throw new Error(`Channel ${config.name} is missing a valid audience.`);
        }

        this.name = config.name;
        this.description = config.description;

        this.minRequiredRole = typeof config.minRequiredRole === 'undefined'
            ? null
            : config.minRequiredRole;

        // for debugging purposes, which bundle it came from
        this.bundle = config.bundle || null;
        this.audience = config.audience || new WorldAudience();
        this.color = config.color || null;
        this.aliases = config.aliases;
        this.formatter = config.formatter || {
            sender: this.formatToSender.bind(this),
            target: this.formatToRecipient.bind(this),
        };
    }

    public colorify(message: string): string {
        if (!this.color) {
            return message;
        }

        const colors = Array.isArray(this.color) ? this.color : [this.color];

        const open = colors.map(color => `<${color}>`).join('');
        const close = colors.reverse()
            .map(color => `</${color}>`)
            .join('');

        return open + message + close;
    }

    public describeSelf(sender: Character): void {
        if (sender instanceof Player) {
            sayAt(sender, `\r\nChannel: ${this.name}`);
            sayAt(sender, `Syntax: ${this.getUsage()}`);

            if (this.description) {
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
        target: Character,
        message: string,
        colorify: Function
    ): string {
        return this.formatToSender(sender, target, message, colorify);
    }

    /**
     * How to render the message the player just sent to the channel
     * E.g., you may want "chat" to say "You chat, 'message here'"
     */
    public formatToSender(
        sender: Character,
        target: Character,
        message: string,
        colorify: Function
    ): string {
        return colorify(`[${this.name}] ${sender.name}: ${message}`);
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
    public send(state: GameState, sender: Character, msg: string): void {
        // If they don't include a message, explain how to use the channel.
        if (msg.length === 0) {
            throw new NoMessageError();
        }

        if (!this.audience) {
            throw new Error(`Channel [${this.name} has invalid audience [${this.audience}]`);
        }

        let message = msg;

        this.audience.configure({state, sender, message});
        const targets = this.audience.getBroadcastTargets();

        if (this.audience instanceof PartyAudience && !targets.length) {
            throw new NoPartyError();
        }

        // Allow audience to change message e.g., strip target name.
        message = this.audience.alterMessage(message);

        // Private channels also send the target player to the formatter
        if (sender instanceof Player) {
            if (this.audience instanceof PrivateAudience) {
                if (!targets.length) {
                    throw new NoRecipientError();
                }
                sayAt(
                    sender,
                    this.formatter.sender(sender, targets[0], message, this.colorify.bind(this))
                );
            }
            else {
                sayAt(
                    sender,
                    this.formatter.sender(sender, null, message, this.colorify.bind(this))
                );
            }
        }

        // send to audience targets
        sayAtFormatted(
            this.audience,
            message,
            (target, mess) => this.formatter.target(sender, target, mess, this.colorify.bind(this))
        );

        // strip color tags
        const rawMessage = message.replace(/<\/?\w+?>/gmu, '');

        for (const target of targets) {
            /**
             * Docs limit this to be for ScriptableEntity (Area/Room/Item), but
             * also applies to NPC and Player
             */
            target.dispatch(new ChannelReceiveEvent({channel: this, message: rawMessage, sender: sender}));
        }
    }
}

export default Channel;
