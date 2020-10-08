import type GameStateData from '../game-state-data';
import type MudEventEmitterInterface from '../events/mud-event-emitter-interface';
import type SerializedGameEntity from './serialized-game-entity';

export interface GameEntityInterface extends MudEventEmitterInterface {
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    __hydrated: boolean;
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    __pruned: boolean;
    entityReference: string | null;
    description: string;
    deserialize: (data?: SerializedGameEntity, state?: GameStateData | null) => void;
    getMeta: <T = unknown>(key: string) => (T | null);
    hydrate: (state: GameStateData) => void;
    name: string;
    serialize: () => SerializedGameEntity;
    setMeta: <T = unknown>(key: string, newValue: T) => void;
}

export default GameEntityInterface;
