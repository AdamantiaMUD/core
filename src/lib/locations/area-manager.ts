import { ADAMANTIA_INTERNAL_BUNDLE } from '../bundle-manager.js';
import { UpdateTickEvent } from '../common/events/index.js';
import MudEventEmitter from '../events/mud-event-emitter.js';
import type GameStateData from '../game-state-data.js';
import { hasValue } from '../util/functions.js';

import Area from './area.js';
import Room from './room.js';

/**
 * Stores references to, and handles distribution of, active areas
 */
export class AreaManager extends MudEventEmitter {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private _placeholder: Area | null = null;
    private readonly _state: GameStateData;
    private readonly _areas: Map<string, Area> = new Map<string, Area>();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(state: GameStateData) {
        super();

        this._state = state;

        this.listen(UpdateTickEvent.getName(), this._tickAll.bind(this));
    }

    private _tickAll(): void {
        for (const [, area] of this._areas) {
            area.dispatch(new UpdateTickEvent({ state: this._state }));
        }
    }

    public get areas(): Map<string, Area> {
        return this._areas;
    }

    public addArea(area: Area): void {
        this._areas.set(area.name, area);
    }

    public getArea(name: string): Area | null {
        return this._areas.get(name) ?? null;
    }

    public getAreaByReference(entityRef: string | null): Area | null {
        if (!hasValue(entityRef)) {
            return null;
        }

        const [name] = entityRef.split(':');

        return this.getArea(name);
    }

    /**
     * Get the placeholder area used to house players who were loaded into
     * an invalid room
     */
    public getPlaceholderArea(): Area {
        if (hasValue(this._placeholder)) {
            return this._placeholder;
        }

        this._placeholder = new Area(ADAMANTIA_INTERNAL_BUNDLE, 'placeholder', {
            name: 'Placeholder',
        });

        const placeholderRoom = new Room(
            {
                id: 'placeholder',
                title: 'Placeholder',
                description:
                    'You are not in a valid room. Please contact an administrator.',
            },
            this._placeholder
        );

        this._placeholder.addRoom(placeholderRoom);

        return this._placeholder;
    }

    public removeArea(area: Area): boolean {
        return this._areas.delete(area.name);
    }
}

export default AreaManager;
