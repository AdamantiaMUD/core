import wrapAnsi from 'wrap-ansi';
import {sprintf} from 'sprintf-js';

import {cast} from '../util/functions';
import {
    colorize,
    isBroadcastable,
    NOOP_FORMATTER,
} from '../util/communication';

import type Player from '../players/player';
import type Broadcastable from './broadcastable';
import type MessageFormatter from './message-formatter';

/**
 * Functions used for sending text to the player. All output to the player
 * should happen through this code.
 */
const DEFAULT_LINE_LENGTH = 80;

/* eslint-disable-next-line id-length */
export const at = (
    source: Broadcastable,
    message: string = '',
    wrapWidth: number = 0,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => {
    if (!isBroadcastable(source)) {
        throw new Error(sprintf(
            'Tried to broadcast message to non-broadcastable object: MESSAGE [%1$s]',
            message
        ));
    }

    for (const target of source.getBroadcastTargets()) {
        if ('socket' in target) {
            const playerTarget = cast<Player>(target);

            if (playerTarget.socket?.writable) {
                if (playerTarget.socket.prompted) {
                    playerTarget.socket.write('');
                    playerTarget.socket.setPrompted(false);
                }

                let targetMessage = formatter(playerTarget, message);

                targetMessage = wrapWidth > 0
                    ? wrapAnsi(targetMessage, Number(wrapWidth))
                    : colorize(targetMessage);

                playerTarget.socket.write(targetMessage);
            }
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
    excludes: Broadcastable | Broadcastable[] = [],
    wrapWidth: number = 0,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => {
    if (!isBroadcastable(source)) {
        throw new Error(sprintf(
            'Tried to broadcast message to non-broadcastable object: MESSAGE [%1$s]',
            message
        ));
    }

    const excludesArr: Broadcastable[] = Array.isArray(excludes) ? excludes : [excludes];

    const targets = source.getBroadcastTargets()
        .filter((target: Broadcastable) => !excludesArr.includes(target));

    const newSource = {
        getBroadcastTargets: (): Broadcastable[] => targets,
    };

    at(newSource, message, wrapWidth, formatter);
};

/**
 * Helper wrapper around at to be used when you're using a formatter
 * @see {@link Broadcast#at}
 */
export const atFormatted = (
    source: Broadcastable,
    message: string = '',
    formatter: MessageFormatter = NOOP_FORMATTER,
    wrapWidth: number = 0
): void => at(source, message, wrapWidth, formatter);

/**
 * Render a line of a specific width/color
 */
export const line = (width: number, fillChar: string = '-', color: string = ''): string => {
    let openColor = '',
        closeColor = '';

    if (color !== '') {
        openColor = `{${color} `;
        closeColor = '}';
    }

    const arr = new Array(width + 1);

    return `${openColor}${arr.join(fillChar)}${closeColor}`;
};

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

    if (color !== '') {
        openColor = `{${color} `;
        closeColor = '}';
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
export const indent = (message: string, padSize: number): string => {
    const padding = line(padSize, ' ');

    return padding + message.replace(/\n/gu, `\n${padding}`);
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
    const openColor = `{${color}.bold `;
    const closeColor = '}';
    let buf = `${openColor + leftDelim}`;
    const widthPercent = Math.round((pct / 100) * width);

    buf += line(widthPercent, barChar) + (pct === 100 ? '' : rightDelim);
    buf += line(width - widthPercent, fillChar);
    buf += `${rightDelim}${closeColor}`;

    return buf;
};

/**
 * `at` with a newline
 * @see {@link Broadcast#at}
 */
export const sayAt = (
    source: Broadcastable,
    message: string = '',
    wrapWidth: number = 0,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => at(
    source,
    message,
    wrapWidth,
    (target: Broadcastable, msg: string) => formatter(target, msg)
);

/**
 * Render the player's prompt including any extra prompts
 */
export const prompt = (
    player: Player,
    extra: {[key: string]: unknown} = {},
    wrapWidth: number = 0
): void => {
    player.socket!.setPrompted(false);

    at(
        player,
        `${player.interpolatePrompt(player.prompt, extra)} `,
        wrapWidth
    );

    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    const needsNewline = player.extraPrompts.size > 0;

    if (needsNewline) {
        sayAt(player);
    }

    for (const [id, extraPrompt] of player.extraPrompts) {
        sayAt(player, extraPrompt.renderer(), wrapWidth);

        if (extraPrompt.removeOnRender) {
            player.removePrompt(id);
        }
    }

    if (needsNewline) {
        at(player, '> ');
    }

    player.socket!.setPrompted(true);

    if (player.socket!.writable) {
        player.socket!.command('goAhead');
    }
};

export const sayAtColumns = (target: Player, strings: string[], numCols: number): void => {
    // Build a 2D map of strings by col/row
    let col = 0,
        row = 0;
    const perCol = Math.ceil(strings.length / numCols);

    let rowCount = 0;
    const colWidth = Math.floor((3 * 20) / numCols);

    const columnedStrings = strings.reduce((map: string[][], str: string) => {
        if (rowCount >= perCol) {
            rowCount = 0;
            col += 1;

            map.push([]);
        }

        map[col].push(str);

        rowCount += 1;

        return map;
    }, [[]]);

    const said: string[] = [];

    col = 0;
    while (said.length < strings.length) {
        if (columnedStrings[col]?.[row]?.length > 0) {
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
    wrapWidth: number = 0,
    formatter: MessageFormatter = NOOP_FORMATTER
): void => atExcept(
    source,
    message,
    excludes,
    wrapWidth,
    (target: Broadcastable, mess: string) => formatter(target, mess)
);

/**
 * `atFormatted` with a newline
 * @see {@link Broadcast#atFormatted}
 */
export const sayAtFormatted = (
    source: Broadcastable,
    message: string = '',
    formatter: MessageFormatter = NOOP_FORMATTER,
    wrapWidth: number = 0
): void => sayAt(source, message, wrapWidth, formatter);

/**
 * Wrap a message to a given width. Note: Evaluates color tags
 */
export const wrap = (
    message: string,
    width: number = DEFAULT_LINE_LENGTH
): string => wrapAnsi(colorize(message), width);

const broadcast = {
    /* eslint-disable-next-line id-length */
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

export default broadcast;
