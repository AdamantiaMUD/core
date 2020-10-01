declare module 'rando-js' {
    function coinFlip(): 0 | 1;
    function fromArray<T = unknown>(arr: T[]): T;
    function inRange(min: number, max: number): number;
    function probability(chance: number): boolean;
    function roll(count: number, sides: number): number;
}
