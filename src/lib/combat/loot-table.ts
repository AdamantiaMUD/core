import {Chance} from 'chance';

import {hasValue} from '../util/functions';

import type GameStateData from '../game-state-data';
import type SimpleMap from '../util/simple-map';

export interface CurrencyDefinition {
    max: number;
    min: number;
}

export type PoolDefinition = Map<string, number>;

export type PoolReference = Record<string, number> | string;

export interface LootTableConfig {
    currencies?: Record<string, CurrencyDefinition> | null;
    options?: {
        maxItems?: number;
        [key: string]: number | string | undefined;
    };
    pools?: PoolReference[];
}

export const DEFAULT_CONFIG = {
    currencies: null,
    options: {
        maxItems: 5,
    },
    pools: [],
};

/**
 * Map<area name, loot pools>
 */
const loadedPools: SimpleMap<SimpleMap<PoolDefinition>> = {};

/**
 * A loot table is made up of one or more loot pools. The `roll()` method will
 * determine drops from the pools up to `maxItems` drops
 */
export class LootTable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _chance: Chance.Chance = new Chance();
    private readonly _loading: Promise<void>;
    private readonly _currencyRanges: Record<string, CurrencyDefinition> | null;
    private readonly _options: {maxItems: number; [key: string]: number | string};
    private readonly _poolData: PoolReference[];

    private _pools: PoolDefinition[] = [];
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    /**
     * See bundles/ranvier-areas/areas/limbo/npcs.yml for example of usage
     * @param {Array<PoolReference|Object>} config.pools List of pool references or pool definitions
     */
    public constructor(state: GameStateData, config: LootTableConfig = DEFAULT_CONFIG) {
        this._poolData = config.pools ?? [];
        this._currencyRanges = config.currencies ?? null;

        this._options = {maxItems: 5, ...config.options ?? {}};

        this._loading = this.load(state);
    }

    /**
     * Find out how much of the different currencies this NPC will drop
     * @return {Array<{{name: string, amount: number}}>}
     */
    public currencies(): Array<{amount: number; name: string}> {
        if (!hasValue(this._currencyRanges)) {
            return [];
        }

        const result: Array<{amount: number; name: string}> = [];

        for (const [currency, entry] of Object.entries(this._currencyRanges)) {
            const {max, min} = entry;

            const amount: number = this._chance.integer({min, max});

            if (amount > 0) {
                result.push({amount: amount, name: currency});
            }
        }

        return result;
    }

    public async load(state: GameStateData): Promise<void> {
        const resolved: PoolDefinition[][] = [];

        for (const pool of this._poolData) {
            /* eslint-disable-next-line no-await-in-loop */
            resolved.push(await this.resolvePool(state, pool));
        }

        this._pools = resolved.flat();
    }

    public async resolvePool(state: GameStateData, ref: PoolReference): Promise<PoolDefinition[]> {
        return [];

        // if (typeof ref !== 'string') {
        //     // pool is a ready-built pool definition
        //     return [new Map(Object.entries(ref))];
        // }
        //
        // /*
        //  * otherwise pool entry is: "myarea:foopool" so try to load
        //  * loot-pools.json from the appropriate area
        //  */
        // const poolArea = state.areaManager.getAreaByReference(ref);
        //
        // if (!hasValue(poolArea)) {
        //     Logger.error(`Invalid item pool area: ${ref}`);
        //
        //     return [];
        // }
        //
        // if (!hasValue(loadedPools[poolArea.name])) {
        //     try {
        //         const loader = state.entityLoaderRegistry.get('loot-pools');
        //
        //         if (hasValue(loader)) {
        //             loader.setBundle(poolArea.bundle);
        //             loader.setArea(poolArea.name);
        //
        //             /* eslint-disable-next-line require-atomic-updates */
        //             loadedPools[poolArea.name] = await loader.fetchAll<PoolDefinition>();
        //         }
        //     }
        //     catch {
        //         Logger.error(`Area has no pools definition: ${ref}`);
        //
        //         return [];
        //     }
        // }
        //
        // const availablePools = loadedPools[poolArea.name];
        //
        // const [, poolName] = ref.split(':');
        //
        // if (!(poolName in availablePools)) {
        //     Logger.error(`Area item pools does not include ${poolName}`);
        //
        //     return [];
        // }
        //
        // const resolvedPool = availablePools[poolName];
        //
        // let pool = resolvedPool;
        //
        // if (Array.isArray(resolvedPool)) {
        //     const nestedResolved: PoolDefinition[][] = [];
        //
        //     for (const nestedPool of resolvedPool) {
        //         /* eslint-disable-next-line no-await-in-loop */
        //         nestedResolved.push(await this.resolvePool(state, nestedPool));
        //     }
        //
        //     // resolved pool is a meta pool (pool of pools) so recursively resolve it
        //     pool = nestedResolved.reduce((acc, val) => acc.concat(val), []);
        // }
        //
        // return Array.isArray(pool) ? pool : [new Map(Object.entries(pool))];
    }

    public async roll(): Promise<string[]> {
        await this._loading;

        const items: string[] = [];

        for (const pool of this._pools) {
            if (items.length >= this._options.maxItems) {
                break;
            }

            for (const [item, chance] of pool) {
                if (this._chance.bool({likelihood: chance})) {
                    items.push(item);
                }

                if (items.length >= this._options.maxItems) {
                    break;
                }
            }
        }

        return items;
    }
}

export default LootTable;
