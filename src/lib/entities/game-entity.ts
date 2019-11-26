import cloneFactory from 'rfdc';

import GameState from '../game-state';
import Metadatable, {MetadataUpdatedEvent} from '../data/metadatable';
import Serializable from '../data/serializable';
import SimpleMap from '../util/simple-map';
import get from 'lodash.get';
import set from 'lodash.set';
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

    public deserialize(data?: SerializedGameEntity, state?: GameState): void {
        this.entityReference = data?.entityReference ?? '';
        this._metadata = clone(data?.metadata ?? {});
        this._state = state;
    }

    /*
     * Get metadata by any notation supported by lodash.get
     */
    public getMeta<T = unknown>(key: string): T {
        return get(this._metadata, key);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
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

    /*
     * Set a metadata value.
     *
     * @param {string} key   Key to set. Supports dot notation e.g., `"foo.bar"`
     * @param {*}      newValue Value must be JSON.stringify-able
     * @fires MetadataUpdatedEvent
     */
    public setMeta<T = unknown>(key: string, newValue: T): void {
        const oldValue = get(this._metadata, key);

        set(this._metadata, key, newValue);

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
