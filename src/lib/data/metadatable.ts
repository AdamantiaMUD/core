export interface Metadatable<
    T extends Record<string, unknown> = Record<string, unknown>,
    K extends keyof T = keyof T,
> {
    getMeta: (key: K) => T[K];
    setMeta: (key: K, value: T[K]) => void;
}

export default Metadatable;
