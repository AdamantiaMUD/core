/**
 * Access class for the `adamantia.json` config
 */
export class Config {
    private _cache: {[key: string]: unknown} = {};

    public get<T>(key: string, fallback: T | null = null): T {
        if (key in this._cache) {
            return this._cache[key] as T;
        }

        return fallback as T;
    }

    /**
     * Load `adamantia.json` from disk
     */
    public load(data: {[key: string]: unknown}): void {
        this._cache = data;
    }

    public set<T>(key: string, value: T): void {
        this._cache[key] = value;
    }
}

export default Config;
