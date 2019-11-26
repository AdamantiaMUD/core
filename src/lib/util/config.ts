/**
 * Access class for the `adamantia.json` config
 */
export class Config {
    private cache = {};

    public get(key: string, fallback: unknown = null): unknown {
        if (key in this.cache) {
            return this.cache[key];
        }

        return fallback;
    }

    /**
     * Load `adamantia.json` from disk
     */
    public load(data: unknown): void {
        this.cache = data;
    }

    public set(key: string, value: unknown): void {
        this.cache[key] = value;
    }
}

export default Config;
