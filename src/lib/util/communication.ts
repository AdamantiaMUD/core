import chalk from 'chalk';

import {cast, hasValue} from './functions';

import type Broadcastable from '../communication/broadcastable';
import type MessageFormatter from '../communication/message-formatter';

export const colorize = (msg: string): string => {
    const tplStr: string[] = [];

    // @ts-expect-error -- This is a workaround to make this behave like a tagged template literal
    tplStr.raw = [msg];

    return chalk(cast<TemplateStringsArray>(tplStr));
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
