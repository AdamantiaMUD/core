import type GameStateData from '../game-state-data';
import type MudEventEmitterInterface from '../events/mud-event-emitter-interface';
import type {SerializedGameEntity} from './game-entity';

export interface GameEntityInterface extends MudEventEmitterInterface{
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    __pruned: boolean;
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    __hydrated: boolean;
    entityReference: string | null;
    deserialize: (data?: SerializedGameEntity, state?: GameStateData | null) => void;
    getMeta: <T = unknown>(key: string) => (T | undefined);
    hydrate: (state: GameStateData) => void;
    serialize: () => SerializedGameEntity;
    setMeta: <T = unknown>(key: string, newValue: T) => void;

}

export default GameEntityInterface;
