/**
 * Access class for the `adamantia.json` config
 */
export class Config {
    private cache = {};

    public get(key: string, fallback: any = null): any {
        if (key in this.cache) {
            return this.cache[key];
        }

        return fallback;
    }

    /**
     * Load `adamantia.json` from disk
     */
    public load(data: any): void {
        this.cache = data;
    }

    public set(key: string, value: any): void {
        this.cache[key] = value;
    }
}

export default Config;
