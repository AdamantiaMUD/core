import chalk from 'chalk';

import {cast, hasValue} from './functions';

import type Broadcastable from '../communication/broadcastable';
import type MessageFormatter from '../communication/message-formatter';

export const colorize = (msg: string): string => {
    const tplStr = [];

    // @ts-expect-error -- This is a workaround to make this behave like a tagged template literal
    tplStr.raw = [msg];

    return chalk(cast<TemplateStringsArray>(tplStr));
};

/**
 * Normalize LF unpaired with CR for windows output
 */
export const fixNewlines = (message: string): string => {
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

export const isBroadcastable = (source: unknown): source is Broadcastable => {
    if (!hasValue(source)) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return 'getBroadcastTargets' in (source as any);
};

export const NOOP_FORMATTER: MessageFormatter = (
    target: Broadcastable,
    message: string
): string => message;
