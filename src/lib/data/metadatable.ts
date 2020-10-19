export interface Metadatable<
    T extends {[key: string]: unknown} = {[key: string]: unknown},
    K extends keyof T = keyof T
> {
    getMeta: (key: K) => T[K];
    setMeta: (key: K, value: T[K]) => void;
}

export default Metadatable;
