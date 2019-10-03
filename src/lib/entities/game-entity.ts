import EventEmitter from 'events';
import cloneFactory from 'rfdc';

import GameState from '../game-state';
import Metadatable from '../data/metadatable';
import Serializable from '../data/serializable';
import {SimpleMap} from '../../../index';

const clone = cloneFactory();

export interface SerializedGameEntity {
    entityReference?: string;
    metadata?: SimpleMap;
}

export class GameEntity extends EventEmitter implements Metadatable, Serializable {
    public __pruned: boolean = false;
    public __hydrated: boolean = false;
    public entityReference: string = '';
    public metadata: SimpleMap = {};

    public deserialize(data: SerializedGameEntity = {}, state: GameState): void {
        this.entityReference = data.entityReference ?? '';
        this.metadata = clone(data.metadata ?? {});
    }

    /**
     * Get metadata by dot notation
     * Warning: This method is _very_ permissive and will not error on a
     * non-existent key. Rather, it will return false.
     *
     * @throws Error
     */
    public getMeta(key: string): any {
        if (!this.metadata) {
            throw new Error('Class does not have metadata property');
        }

        const base = this.metadata;

        return key.split('.').reduce((obj, index) => obj && obj[index], base);
    }

    public serialize(): SerializedGameEntity {
        const meta = clone(this.metadata);

        delete meta.class;
        delete meta.lastCommandTime;

        const data: SerializedGameEntity = {metadata: meta};

        if (this.entityReference !== '') {
            data.entityReference = this.entityReference;
        }

        return data;
    }

    /**
     * Set a metadata value.
     * Warning: Does _not_ auto-vivify, you will need to create the parent
     * objects if they don't exist
     *
     * @param {string} key   Key to set. Supports dot notation e.g., `"foo.bar"`
     * @param {*}      value Value must be JSON.stringify-able
     * @throws Error
     * @throws RangeError
     * @fires Metadatable#metadataUpdate
     */
    public setMeta(key: string, value: any): void {
        if (!this.metadata) {
            throw new Error('Class does not have metadata property');
        }

        const parts = key.split('.');
        const property = parts.pop();
        let base = this.metadata;

        while (parts.length) {
            const part = parts.shift();

            if (!(part in base)) {
                throw new RangeError(`Metadata path invalid: ${key}`);
            }
            base = base[part];
        }

        const oldValue = base[property];

        base[property] = value;

        /**
         * @event Metadatable#metadataUpdate
         * @param {string} key
         * @param {*} newValue
         * @param {*} oldValue
         */
        this.emit('metadataUpdated', key, value, oldValue);
    }
}

export default GameEntity;
