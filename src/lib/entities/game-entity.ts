import get from 'lodash.get';
import set from 'lodash.set';

import { MetadataUpdatedEvent } from '../data/events/index.js';
import type Metadatable from '../data/metadatable.js';
import type Serializable from '../data/serializable.js';
import MudEventEmitter from '../events/mud-event-emitter.js';
import type GameStateData from '../game-state-data.js';
import { hasValue } from '../util/functions.js';
import { clone } from '../util/objects.js';
import type SimpleMap from '../util/simple-map.js';

import type GameEntityDefinition from './game-entity-definition.js';
import type SerializedGameEntity from './serialized-game-entity.js';

export abstract class GameEntity
    extends MudEventEmitter
    implements Metadatable, Serializable
{
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    public __hydrated: boolean = false;
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    public __pruned: boolean = false;
    public entityReference: string = '';

    protected _description: string = '';
    protected _name: string = '';
    protected _state: GameStateData | null = null;

    private _metadata: SimpleMap = {};
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    protected constructor(def?: GameEntityDefinition) {
        super();

        this._metadata = clone(def?.metadata ?? {});
    }

    public get description(): string {
        return this._description;
    }

    public get name(): string {
        return this._name;
    }

    public deserialize(
        data?: SerializedGameEntity,
        state: GameStateData | null = null
    ): void {
        this.entityReference = data?.entityReference ?? '';
        this._metadata = clone(data?.metadata ?? {});
        this._state = state;
    }

    /*
     * Get metadata by any notation supported by lodash.get
     */
    public getMeta<T = unknown>(key: string): T | null {
        const meta: unknown = get(this._metadata, key);

        if (!hasValue(meta)) {
            return null;
        }

        return meta as T;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public hydrate(state: GameStateData): void {
        // no-op
    }

    public serialize(): SerializedGameEntity {
        const meta = clone(this._metadata);

        delete meta.class;
        delete meta.lastCommandTime;

        const data: SerializedGameEntity = {
            entityReference: null,
            metadata: meta,
        };

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
        this.dispatch(new MetadataUpdatedEvent({ key, newValue, oldValue }));
    }

    public setPruned(isPruned: boolean = true): void {
        this.__pruned = isPruned;
    }
}

export default GameEntity;
