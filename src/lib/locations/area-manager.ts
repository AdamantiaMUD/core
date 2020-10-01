import MudEventEmitter from '../events/mud-event-emitter';
import {hasValue} from '../util/functions';
import Area from './area';
import GameStateData from '../game-state-data';
import Room from './room';
import {UpdateTickEvent} from '../common/common-events';

/**
 * Stores references to, and handles distribution of, active areas
 */
export class AreaManager extends MudEventEmitter {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private placeholder: Area;
    private readonly state: GameState;

    public areas: Map<string, Area> = new Map();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(state: GameState) {
        super();

        this.state = state;

        this.listen(UpdateTickEvent.getName(), this.tickAll.bind(this));
    }

    private tickAll(): void {
        for (const [, area] of this.areas) {
            area.dispatch(new UpdateTickEvent({state: this.state}));
        }
    }

    public addArea(area: Area): void {
        this.areas.set(area.name, area);
    }

    public getArea(name: string): Area | null {
        return this.areas.get(name) ?? null;
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
        if (this.placeholder) {
            return this.placeholder;
        }

        this.placeholder = new Area(
            null,
            'placeholder',
            {name: 'Placeholder'}
        );

        const placeholderRoom = new Room({
            id: 'placeholder',
            title: 'Placeholder',
            description: 'You are not in a valid room. Please contact an administrator.',
        }, this.placeholder);

        this.placeholder.addRoom(placeholderRoom);

        return this.placeholder;
    }

    public removeArea(area: Area): boolean {
        return this.areas.delete(area.name);
    }
}

export default AreaManager;
