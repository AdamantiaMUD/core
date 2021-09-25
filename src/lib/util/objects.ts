import cloneFactory from 'rfdc';

import {hasValue} from './functions';

/**
 * Check to see if a given object is iterable
 */
export const isIterable = (obj: unknown): boolean => {
    if (!hasValue(obj)) {
        return false;
    }

    if (Array.isArray(obj)) {
        return true;
    }

    if (typeof obj === 'object') {
        return Symbol.iterator in obj!;
    }

    return false;
};

/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
export const clone: <T = unknown>(obj: T) => T = cloneFactory();
