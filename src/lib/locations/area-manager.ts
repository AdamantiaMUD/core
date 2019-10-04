import EventEmitter from 'events';

import Area from './area';
import GameState from '../game-state';
import Room from './room';

/**
 * Stores references to, and handles distribution of, active areas
 */
export class AreaManager extends EventEmitter {
    /* eslint-disable lines-between-class-members */
    private placeholder: Area;
    private readonly state: GameState;

    public areas: Map<string, Area> = new Map();
    /* eslint-enable lines-between-class-members */

    public constructor(state: GameState) {
        super();

        this.state = state;

        this.on('update-tick', this.tickAll);
    }

    private tickAll(): void {
        for (const [, area] of this.areas) {
            /**
             * @see Area#update
             * @event Area#updateTick
             */
            area.emit('update-tick', this.state);
        }
    }

    public addArea(area: Area): void {
        this.areas.set(area.name, area);
    }

    public getArea(name: string): Area {
        return this.areas.get(name);
    }

    public getAreaByReference(entityRef: string): Area {
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

        const placeholderRoom = new Room(this.placeholder, {
            id: 'placeholder',
            title: 'Placeholder',
            description: 'You are not in a valid room. Please contact an administrator.',
        });

        this.placeholder.addRoom(placeholderRoom);

        return this.placeholder;
    }

    public removeArea(area: Area): boolean {
        return this.areas.delete(area.name);
    }
}

export default AreaManager;
