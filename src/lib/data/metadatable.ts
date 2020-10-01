export interface Metadatable {
    getMeta: (key: string) => unknown;
    setMeta: (key: string, value: unknown) => void;
}

export default Metadatable;
