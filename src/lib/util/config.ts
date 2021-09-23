import get from 'lodash.get';
import merge from 'deepmerge';
import set from 'lodash.set';

import Logger from '../common/logger';
import {hasValue} from './functions';

export interface MudConfig {
    abilities?: {
        skillLag?: number;
    };
    bundles: string[];
    logfile: string;
    paths: {
        bundles: string;
        data: string;
        root: string;
    };
    players: {
        accountName?: {
            maxLength?: number;
            minLength?: number;
        };
        inventory?: {
            maxSize?: number;
        };
        startingRoom: string;
    };
    ports: Record<string, number>;
}

const DEFAULT_CONFIG: MudConfig = {
    abilities: {
        skillLag: 0,
    },
    bundles: [],
    logfile: '',
    paths: {
        bundles: '',
        data: '',
        root: '',
    },
    players: {
        accountName: {
            maxLength: 16,
            minLength: 4,
        },
        inventory: {maxSize: 30},
        startingRoom: 'dragonshade:r0001',
    },
    ports: {},
};

/**
 * Access class for the `adamantia.json` config
 */
export class Config {
    private _config: MudConfig = DEFAULT_CONFIG;

    public dump(): void {
        Logger.verbose(JSON.stringify(this._config, null, 4));
    }

    public getBundles(): string[] {
        return this._config.bundles;
    }

    public getLogfile(): string {
        return this._config.logfile;
    }

    public get<T = unknown>(key: string, defaultValue?: T): T | null {
        const value = get(this._config, key) as T;

        if (!hasValue(value)) {
            return defaultValue ?? null;
        }

        return value;
    }

    public set(key: string, value: unknown): void {
        set(this._config, key, value);
    }

    public getStartingRoom(): string {
        return this._config.players.startingRoom;
    }

    public getPath(which: keyof MudConfig['paths']): string {
        return this._config.paths[which];
    }

    public getPort(which: string, defaultValue: number): number {
        if (hasValue(this._config.ports[which])) {
            return this._config.ports[which];
        }

        return defaultValue;
    }

    /**
     * Load `adamantia.json` from disk
     */
    public load(data: MudConfig): void {
        this._config = merge(this._config, data);
    }
}

export default Config;
