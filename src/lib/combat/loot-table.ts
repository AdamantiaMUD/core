import Random from 'rando-js';

import GameState from '../game-state';
import Logger from '../util/logger';

export interface CurrencyDefinition {
    max: number;
    min: number;
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type PoolDefinition = Map<string, number>;

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type PoolReference = string | {[key: string]: number};

export interface LootTableConfig {
    currencies?: {[key: string]: CurrencyDefinition};
    options?: {
        maxItems?: number;
        [key: string]: number | string;
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

const loadedPools = {};

/**
 * A loot table is made up of one or more loot pools. The `roll()` method will
 * determine drops from the pools up to `maxItems` drops
 */
export class LootTable {
    private readonly _loading: Promise<void>;
    private readonly currencyRanges: {[key: string]: CurrencyDefinition};
    private readonly options: {maxItems: number; [key: string]: number | string};
    private readonly poolData: PoolReference[];
    private pools: PoolDefinition[];

    /**
     * See bundles/ranvier-areas/areas/limbo/npcs.yml for example of usage
     * @param {Array<PoolReference|Object>} config.pools List of pool references or pool definitions
     */
    public constructor(state: GameState, config: LootTableConfig = DEFAULT_CONFIG) {
        this.poolData = config.pools || [];
        this.currencyRanges = config.currencies || null;

        this.options = {maxItems: 5, ...config.options || {}};

        this._loading = this.load(state);
    }

    /**
     * Find out how much of the different currencies this NPC will drop
     * @return {Array<{{name: string, amount: number}}>}
     */
    public currencies(): Array<{amount: number; name: string}> {
        if (!this.currencyRanges) {
            return [];
        }

        const result = [];

        for (const [currency, entry] of Object.entries(this.currencyRanges)) {
            const amount: number = Random.inRange(entry.min, entry.max);

            if (amount > 0) {
                result.push({amount: amount, name: currency});
            }
        }

        return result;
    }

    public async load(state: GameState): Promise<void> {
        const resolved = [];

        for (const pool of this.poolData) {
            /* eslint-disable-next-line no-await-in-loop */
            resolved.push(await this.resolvePool(state, pool));
        }

        this.pools = resolved.reduce((acc, val) => acc.concat(val), []);
    }

    public async resolvePool(state: GameState, ref: PoolReference): Promise<PoolDefinition[]> {
        if (typeof ref !== 'string') {
            // pool is a ready-built pool definition
            return [new Map(Object.entries(ref))];
        }

        /*
         * otherwise pool entry is: "myarea:foopool" so try to load
         * loot-pools.json from the appropriate area
         */
        const poolArea = state.areaManager.getAreaByReference(ref);

        if (poolArea === undefined) {
            Logger.error(`Invalid item pool area: ${ref}`);

            return [];
        }

        if (typeof loadedPools[poolArea.name] === 'undefined') {
            try {
                const loader = state.entityLoaderRegistry.get('loot-pools');

                loader.setBundle(poolArea.bundle);
                loader.setArea(poolArea.name);

                /* eslint-disable-next-line require-atomic-updates */
                loadedPools[poolArea.name] = await loader.fetchAll();
            }
            catch {
                Logger.error(`Area has no pools definition: ${ref}`);

                return [];
            }
        }

        const availablePools = loadedPools[poolArea.name];

        const [, poolName] = ref.split(':');

        if (!(poolName in availablePools)) {
            Logger.error(`Area item pools does not include ${poolName}`);

            return [];
        }

        const resolvedPool = availablePools[poolName];

        let pool = resolvedPool;

        if (Array.isArray(resolvedPool)) {
            const nestedResolved = [];

            for (const nestedPool of resolvedPool) {
                /* eslint-disable-next-line no-await-in-loop */
                nestedResolved.push(await this.resolvePool(state, nestedPool));
            }

            // resolved pool is a meta pool (pool of pools) so recursively resolve it
            pool = nestedResolved.reduce((acc, val) => acc.concat(val), []);
        }

        return Array.isArray(pool) ? pool : [new Map(Object.entries(pool))];
    }

    public async roll(): Promise<string[]> {
        await this._loading;

        const items = [];

        for (const pool of this.pools) {
            if (items.length >= this.options.maxItems) {
                break;
            }

            for (const [item, chance] of pool) {
                if (Random.probability(chance)) {
                    items.push(item);
                }

                if (items.length >= this.options.maxItems) {
                    break;
                }
            }
        }

        return items;
    }
}

export default LootTable;
