/**
 * Check to see if a given object is iterable
 */
export const isIterable = (obj: unknown): boolean => obj && typeof obj[Symbol.iterator] === 'function';
