/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any -- `any` is actually required here */
export const cast = <T>(obj: any): T => obj as unknown as T;

export const hasValue = <T>(thing: T | null | undefined): thing is T => !(thing === null || typeof thing === 'undefined');

export const ident = <T = unknown>(obj: T): T => obj;

export const isPositiveNumber = (thing: unknown | null | undefined): thing is number => {
    if (!hasValue(thing)) {
        return false;
    }

    if (Number.isNaN(thing)) {
        return false;
    }

    return thing as number > 0;
};

export const noop = (): undefined => undefined;

/* eslint-disable-next-line @typescript-eslint/ban-types */
export const safeBind = <T extends Function>(
    func: T,
    thisArg: unknown,
    ...argArray: unknown[]
): T => cast<T>(func.bind(thisArg, argArray));
