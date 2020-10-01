import {hasValue} from '../util/functions';

export const ArgParser = {
    /**
     * Parse "get 2.foo bar"
     * @param {string}   search    2.foo
     * @param {Iterable} list      Where to look for the item
     * @param {boolean}  returnKey If `list` is a Map, true to return the KV
     *                             tuple instead of just the entry
     * @returns {*} Boolean on error otherwise an entry from the list
     */
    parseDot: <T extends {keywords?: string[]; name?: string; uuid: string}>(
        search: string,
        list: Array<T | [string, T]>,
        returnKey: boolean = false
    ): unknown => {
        if (!hasValue(list)) {
            return null;
        }

        const parts = search.split('.');
        let findNth = 1,
            keyword: string | null = null;

        if (parts.length > 2) {
            return false;
        }

        if (parts.length === 1) {
            keyword = parts[0];
        }
        else {
            findNth = parseInt(parts[0], 10);
            keyword = parts[1];
        }

        let encountered = 0;

        for (const entity of list) {
            let key: string | null = null,
                entry: T | null = null;

            if (Array.isArray(entity)) {
                [key, entry] = entity;
            }
            else {
                entry = entity;
            }

            if (!('keywords' in entry) && !('name' in entry)) {
                throw new Error('Items in list have no keywords or name');
            }

            // prioritize keywords over item/player names
            if (hasValue(entry.keywords) && (entry.keywords.includes(keyword) || entry.uuid === keyword)) {
                encountered += 1;

                if (encountered === findNth) {
                    return returnKey ? [key, entry] : entry;
                }
            }
            else if (hasValue(entry.name) && entry.name.toLowerCase().includes(keyword.toLowerCase())) {
                encountered += 1;

                if (encountered === findNth) {
                    return returnKey ? [key, entry] : entry;
                }
            }
        }

        return false;
    },
};

export default ArgParser;
