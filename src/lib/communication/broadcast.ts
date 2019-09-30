/* eslint-disable max-params, no-magic-numbers, no-underscore-dangle */
import ansi from 'sty';
import wrap from 'wrap-ansi';
import {sprintf} from 'sprintf-js';

import Character from '../entities/character';
import Player from '../players/player';

// force ansi on even when there isn't a tty for the server
ansi.enable();

export interface Broadcastable {
    getBroadcastTargets(): Character[];
}

export type MessageFormatter = (target: Broadcastable, message: string) => string;

const NOOP_FORMATTER: MessageFormatter = (
    target: Broadcastable,
    message: string
): string => message;

/**
 * Class used for sending text to the player. All output to the player should
 * happen through this class.
 */
export class Broadcast {
    private static DEFAULT_LINE_LENGTH = 80;

    /* eslint-disable-next-line id-length */
    public static at(
        source: Broadcastable,
        message: string = '',
        wrapWidth: number | boolean = false,
        useColor: boolean = true,
        formatter: MessageFormatter = NOOP_FORMATTER
    ): void {
        if (!Broadcast.isBroadcastable(source)) {
            throw new Error(sprintf(
                'Tried to broadcast message to non-broadcastable object: MESSAGE [%1$s]',
                message
            ));
        }

        const cleanMessage = Broadcast.fixNewlines(message);

        for (const target of source.getBroadcastTargets()) {
            if (target.socket && target.socket.writable) {
                if (target.socket._prompted) {
                    target.socket.write('\r\n');
                    target.socket._prompted = false;
                }

                let targetMessage = formatter(target, cleanMessage);

                targetMessage = wrapWidth
                    ? Broadcast.wrap(targetMessage, Number(wrapWidth))
                    : ansi.parse(targetMessage);

                target.socket.write(targetMessage);
            }
        }
    }

    /**
     * Broadcast.at for all except given list of players
     * @see {@link Broadcast#at}
     */
    public static atExcept(
        source: Broadcastable,
        message: string = '',
        excludes: Character | Character[] = [],
        wrapWidth: number | boolean = false,
        useColor: boolean = true,
        formatter: MessageFormatter = NOOP_FORMATTER
    ): void {
        if (!Broadcast.isBroadcastable(source)) {
            throw new Error(sprintf(
                'Tried to broadcast message to non-broadcastable object: MESSAGE [%1$s]',
                message
            ));
        }

        const excludesArr = [].concat(excludes);

        const targets = source.getBroadcastTargets()
            .filter(target => !excludesArr.includes(target));

        const newSource = {
            getBroadcastTargets: () => targets,
        };

        Broadcast.at(newSource, message, wrapWidth, useColor, formatter);
    }

    /**
     * Helper wrapper around Broadcast.at to be used when you're using a formatter
     * @see {@link Broadcast#at}
     */
    public static atFormatted(
        source: Broadcastable,
        message: string = '',
        formatter: MessageFormatter = NOOP_FORMATTER,
        wrapWidth: number | boolean = false,
        useColor: boolean = true
    ): void {
        Broadcast.at(source, message, wrapWidth, useColor, formatter);
    }

    /**
     * `Broadcast.at` with a newline
     * @see {@link Broadcast#at}
     */
    public static sayAt(
        source: Broadcastable,
        message: string = '',
        wrapWidth: number | boolean = false,
        useColor: boolean = true,
        formatter: MessageFormatter = NOOP_FORMATTER
    ): void {
        Broadcast.at(
            source,
            message,
            wrapWidth,
            useColor,
            (target, mess) => `${formatter(target, mess)}\r\n`
        );
    }

    /**
     * `Broadcast.atExcept` with a newline
     * @see {@link Broadcast#atExcept}
     */
    public static sayAtExcept(
        source: Broadcastable,
        message: string = '',
        excludes: Character | Character[] = [],
        wrapWidth: number | boolean = false,
        useColor: boolean = true,
        formatter: MessageFormatter = NOOP_FORMATTER
    ): void {
        Broadcast.atExcept(
            source,
            message,
            excludes,
            wrapWidth,
            useColor,
            (target, mess) => `${formatter(target, mess)}\r\n`
        );
    }

    /**
     * `Broadcast.atFormatted` with a newline
     * @see {@link Broadcast#atFormatted}
     */
    public static sayAtFormatted(
        source: Broadcastable,
        message: string = '',
        formatter: MessageFormatter = NOOP_FORMATTER,
        wrapWidth: number | boolean = false,
        useColor: boolean = true
    ): void {
        Broadcast.sayAt(source, message, wrapWidth, useColor, formatter);
    }

    /**
     * Render the player's prompt including any extra prompts
     */
    public static prompt(
        character: Character,
        extra: {[key: string]: any} = {},
        wrapWidth: number | boolean = false,
        useColor: boolean = true
    ): void {
        const player = character as Player;

        player.socket._prompted = false;

        Broadcast.at(
            player,
            `\r\n${player.interpolatePrompt(player.prompt, extra)} `,
            wrapWidth,
            useColor
        );

        const needsNewline = player.extraPrompts.size > 0;

        if (needsNewline) {
            Broadcast.sayAt(player);
        }

        for (const [id, extraPrompt] of player.extraPrompts) {
            Broadcast.sayAt(player, extraPrompt.renderer(), wrapWidth, useColor);

            if (extraPrompt.removeOnRender) {
                player.removePrompt(id);
            }
        }

        if (needsNewline) {
            Broadcast.at(player, '> ');
        }

        player.socket._prompted = true;

        if (player.socket.writable) {
            player.socket.command('goAhead');
        }
    }

    /**
     * Generate an ASCII art progress bar
     */
    public static progress(
        maxWidth: number,
        percent: number,
        color: string,
        barCharacter: string = '#',
        fillCharacter: string = ' ',
        delimiters: string = '()'
    ): string {
        const pct = Math.max(0, percent);
        let width = maxWidth - 3;

        if (pct === 100) {
            width += 1;
        }

        const barChar = barCharacter[0];
        const fillChar = fillCharacter[0];

        const [leftDelim, rightDelim] = delimiters;
        const openColor = `<${color}>`;
        const closeColor = `</${color}>`;
        let buf = `${openColor + leftDelim}<b>`;
        const widthPercent = Math.round((pct / 100) * width);

        buf += Broadcast.line(widthPercent, barChar) + (pct === 100 ? '' : rightDelim);
        buf += Broadcast.line(width - widthPercent, fillChar);
        buf += `</b>${rightDelim}${closeColor}`;

        return buf;
    }

    /**
     * Center a string in the middle of a given width
     */
    public static center(
        width: number,
        message: string,
        color: string = '',
        fillChar: string = ' '
    ): string {
        const padWidth = (width / 2) - (message.length / 2);

        let openColor = '',
            closeColor = '';

        if (color) {
            openColor = `<${color}>`;
            closeColor = `</${color}>`;
        }

        return openColor
            + Broadcast.line(Math.floor(padWidth), fillChar)
            + message
            + Broadcast.line(Math.ceil(padWidth), fillChar)
            + closeColor;
    }

    /**
     * Render a line of a specific width/color
     */
    public static line(width: number, fillChar: string = '-', color: string = ''): string {
        let openColor = '',
            closeColor = '';

        if (color) {
            openColor = `<${color}>`;
            closeColor = `</${color}>`;
        }

        const arr = new Array(width + 1);

        return `${openColor}${arr.join(fillChar)}${closeColor}`;
    }

    /**
     * Wrap a message to a given width. Note: Evaluates color tags
     */
    public static wrap(message: string, width: number = Broadcast.DEFAULT_LINE_LENGTH): string {
        return Broadcast.fixNewlines(wrap(ansi.parse(message), width));
    }

    /**
     * Indent all lines of a given string by a given amount
     */
    public static indent(msg: string, indent: number): string {
        const message = Broadcast.fixNewlines(msg);
        const padding = Broadcast.line(indent, ' ');

        return padding + message.replace(/\r\n/gu, `\r\n${padding}`);
    }

    /**
     * Fix LF unpaired with CR for windows output
     */
    private static fixNewlines(message: string): string {
        // Correct \n not in a \r\n pair to prevent bad rendering on windows
        const msg = message
            .replace(/\r\n/gu, '<NEWLINE>')
            .split('\n')
            .join('\r\n')
            .replace(/<NEWLINE>/gu, '\r\n');

        // Correct sty's incredibly stupid default of always appending ^[[0m
        /* eslint-disable-next-line no-control-regex */
        return msg.replace(/\x1B\[0m$/u, '');
    }

    public static isBroadcastable(source: Broadcastable): boolean {
        return source && typeof source.getBroadcastTargets === 'function';
    }
}

export default Broadcast;
