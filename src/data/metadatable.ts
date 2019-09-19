export interface Metadatable {
    getMeta: (key: string) => any;
    setMeta: (key: string, value: any) => void;
}

export default Metadatable;
