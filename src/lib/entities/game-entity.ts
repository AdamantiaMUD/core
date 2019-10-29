import cloneFactory from 'rfdc';

import GameState from '../game-state';
import Metadatable, {MetadataUpdatedEvent} from '../data/metadatable';
import Serializable from '../data/serializable';
import SimpleMap from '../util/simple-map';
import {MudEventEmitter} from '../events/mud-event';

const clone = cloneFactory();

export interface GameEntityDefinition {
    metadata?: SimpleMap;
}

export interface SerializedGameEntity {
    entityReference?: string;
    metadata?: SimpleMap;
}

export class GameEntity extends MudEventEmitter implements Metadatable, Serializable {
    private _metadata: SimpleMap = {};

    protected _state: GameState;

    public __pruned: boolean = false;
    public __hydrated: boolean = false;
    public entityReference: string = '';

    public constructor(def?: GameEntityDefinition) {
        super();

        this._metadata = clone(def?.metadata ?? {});
    }

    public deserialize(data: SerializedGameEntity = {}, state?: GameState): void {
        this.entityReference = data.entityReference ?? '';
        this._metadata = clone(data.metadata ?? {});
        this._state = state;
    }

    /**
     * Get metadata by dot notation
     * Warning: This method is _very_ permissive and will not error on a
     * non-existent key. Rather, it will return false.
     *
     * @throws Error
     */
    public getMeta(key: string): any {
        const base = this._metadata;

        return key.split('.').reduce((obj, index) => obj && obj[index], base);
    }

    public hydrate(state: GameState): void {
        // no-op
    }

    public serialize(): SerializedGameEntity {
        const meta = clone(this._metadata);

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
     * @param {*}      newValue Value must be JSON.stringify-able
     * @throws Error
     * @throws RangeError
     * @fires MetadataUpdatedEvent
     */
    public setMeta(key: string, newValue: any): void {
        const parts = key.split('.');
        const property = parts.pop();
        let base = this._metadata;

        while (parts.length) {
            const part = parts.shift();

            if (!(part in base)) {
                throw new RangeError(`Metadata path invalid: ${key}`);
            }
            base = base[part];
        }

        const oldValue = base[property];

        base[property] = newValue;

        /**
         * @event Metadatable#metadataUpdate
         * @param {string} key
         * @param {*} newValue
         * @param {*} oldValue
         */
        this.dispatch(new MetadataUpdatedEvent({key, newValue, oldValue}));
    }
}

export default GameEntity;
