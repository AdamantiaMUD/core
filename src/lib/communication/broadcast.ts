import wrapAnsi from 'wrap-ansi';
import {sprintf} from 'sprintf-js';

import Player from '../players/player';

export interface Broadcastable {
    getBroadcastTargets: () => Broadcastable[];
}

export type MessageFormatter = (target: Broadcastable, message: string) => string;

const NOOP_FORMATTER: MessageFormatter = (
    target: Broadcastable,
    message: string
): string => message;

/**
 * Functions used for sending text to the player. All output to the player
 * should happen through this code.
 */
const DEFAULT_LINE_LENGTH = 80;

/**
 * Fix LF unpaired with CR for windows output
 */

const fixNewlines = (message: string): string => {
    // Correct \n not in a \r\n pair to prevent bad rendering on windows
    const msg = message
        .replace(/\r\n/gu, '<NEWLINE>')
        .split('\n')
        .join('\r\n')
        .replace(/<NEWLINE>/gu, '\r\n');

    // Correct sty's incredibly stupid default of always appending ^[[0m
    /* eslint-disable-next-line no-control-regex */
    return msg.replace(/\x1B\[0m$/u, '');
};

/* eslint-disable-next-line id-length */
export const at = (
    source: Broadcastable,
    message: string = '',
    wrapWidth: number | boolean = false,
    useColor: boolean = true,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => {
    if (!isBroadcastable(source)) {
        throw new Error(sprintf(
            'Tried to broadcast message to non-broadcastable object: MESSAGE [%1$s]',
            message
        ));
    }

    const cleanMessage = fixNewlines(message);

    for (const target of source.getBroadcastTargets()) {
        if (target.socket && target.socket.writable) {
            if (target.socket._prompted) {
                target.socket.write('\r\n');
                target.socket._prompted = false;
            }

            let targetMessage = formatter(target, cleanMessage);

            targetMessage = wrapWidth
                ? wrapAnsi(targetMessage, Number(wrapWidth))
                : ansi.parse(targetMessage);

            target.socket.write(targetMessage);
        }
    }
};

/**
 * at for all except given list of players
 * @see {@link Broadcast#at}
 */
export const atExcept = (
    source: Broadcastable,
    message: string = '',
    excludes: Player | Player[] = [],
    wrapWidth: number | boolean = false,
    useColor: boolean = true,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => {
    if (!isBroadcastable(source)) {
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

    at(newSource, message, wrapWidth, useColor, formatter);
};

/**
 * Helper wrapper around at to be used when you're using a formatter
 * @see {@link Broadcast#at}
 */
export const atFormatted = (
    source: Broadcastable,
    message: string = '',
    formatter: MessageFormatter = NOOP_FORMATTER,
    wrapWidth: number | boolean = false,
    useColor: boolean = true
): void => at(source, message, wrapWidth, useColor, formatter);

/**
 * Center a string in the middle of a given width
 */
export const center = (
    width: number,
    message: string,
    color: string = '',
    fillChar: string = ' '
): string => {
    const padWidth = (width / 2) - (message.length / 2);

    let openColor = '',
        closeColor = '';

    if (color) {
        openColor = `<${color}>`;
        closeColor = `</${color}>`;
    }

    return openColor
        + line(Math.floor(padWidth), fillChar)
        + message
        + line(Math.ceil(padWidth), fillChar)
        + closeColor;
};

/**
 * Indent all lines of a given string by a given amount
 */
export const indent = (msg: string, indent: number): string => {
    const message = fixNewlines(msg);
    const padding = line(indent, ' ');

    return padding + message.replace(/\r\n/gu, `\r\n${padding}`);
};

export const isBroadcastable = (source: Broadcastable): boolean => source && typeof source.getBroadcastTargets === 'function';

/**
 * Render a line of a specific width/color
 */
export const line = (width: number, fillChar: string = '-', color: string = ''): string => {
    let openColor = '',
        closeColor = '';

    if (color) {
        openColor = `<${color}>`;
        closeColor = `</${color}>`;
    }

    const arr = new Array(width + 1);

    return `${openColor}${arr.join(fillChar)}${closeColor}`;
};

/**
 * Generate an ASCII art progress bar
 */
export const progress = (
    maxWidth: number,
    percent: number,
    color: string,
    barCharacter: string = '#',
    fillCharacter: string = ' ',
    delimiters: string = '()'
): string => {
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

    buf += line(widthPercent, barChar) + (pct === 100 ? '' : rightDelim);
    buf += line(width - widthPercent, fillChar);
    buf += `</b>${rightDelim}${closeColor}`;

    return buf;
};

/**
 * Render the player's prompt including any extra prompts
 */
export const prompt = (
    player: Player,
    extra: {[key: string]: unknown} = {},
    wrapWidth: number | boolean = false,
    useColor: boolean = true
): void => {
    player.socket._prompted = false;

    at(
        player,
        `\r\n${player.interpolatePrompt(player.prompt, extra)} `,
        wrapWidth,
        useColor
    );

    const needsNewline = player.extraPrompts.size > 0;

    if (needsNewline) {
        sayAt(player);
    }

    for (const [id, extraPrompt] of player.extraPrompts) {
        sayAt(player, extraPrompt.renderer(), wrapWidth, useColor);

        if (extraPrompt.removeOnRender) {
            player.removePrompt(id);
        }
    }

    if (needsNewline) {
        at(player, '> ');
    }

    player.socket._prompted = true;

    if (player.socket.writable) {
        player.socket.command('goAhead');
    }
};

/**
 * `at` with a newline
 * @see {@link Broadcast#at}
 */
export const sayAt = (
    source: Broadcastable,
    message: string = '',
    wrapWidth: number | boolean = false,
    useColor: boolean = true,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => at(
    source,
    message,
    wrapWidth,
    useColor,
    (target, mess) => `${formatter(target, mess)}\r\n`
);

export const sayAtColumns = (target: Player, strings: string[], numCols: number): void => {
    // Build a 2D map of strings by col/row
    let col = 0,
        row = 0;
    const perCol = Math.ceil(strings.length / numCols);

    let rowCount = 0;
    const colWidth = Math.floor((3 * 20) / numCols);

    const columnedStrings = strings.reduce((map, string) => {
        if (rowCount >= perCol) {
            rowCount = 0;
            col += 1;
        }
        map[col] = map[col] || [];

        if (!map[col]) {
            map.push([]);
        }

        map[col].push(string);
        rowCount += 1;

        return map;
    }, []);

    const said = [];

    col = 0;
    while (said.length < strings.length) {
        if (columnedStrings[col] && columnedStrings[col][row]) {
            const string = columnedStrings[col][row];

            said.push(string);

            at(target, sprintf(`%-${colWidth}s`, string));
        }

        col += 1;
        if (col === numCols) {
            sayAt(target);
            col = 0;
            row += 1;
        }
    }

    // append another line if need be
    if (col % numCols !== 0) {
        sayAt(target);
    }
};

/**
 * `atExcept` with a newline
 * @see {@link Broadcast#atExcept}
 */
export const sayAtExcept = (
    source: Broadcastable,
    message: string = '',
    excludes: Player | Player[] = [],
    wrapWidth: number | boolean = false,
    useColor: boolean = true,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => atExcept(
    source,
    message,
    excludes,
    wrapWidth,
    useColor,
    (target: Broadcastable, mess: string) => `${formatter(target, mess)}\r\n`
);

/**
 * `atFormatted` with a newline
 * @see {@link Broadcast#atFormatted}
 */
export const sayAtFormatted = (
    source: Broadcastable,
    message: string = '',
    formatter: MessageFormatter = NOOP_FORMATTER,
    wrapWidth: number | boolean = false,
    useColor: boolean = true
): void => sayAt(source, message, wrapWidth, useColor, formatter);

/**
 * Wrap a message to a given width. Note: Evaluates color tags
 */
export const wrap = (
    message: string,
    width: number = DEFAULT_LINE_LENGTH
): string => fixNewlines(wrapAnsi(ansi.parse(message), width));

export default {
    at,
    atExcept,
    atFormatted,
    center,
    indent,
    isBroadcastable,
    line,
    progress,
    prompt,
    sayAt,
    sayAtColumns,
    sayAtExcept,
    sayAtFormatted,
    wrap,
};
