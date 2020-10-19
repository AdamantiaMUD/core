import type MudEvent from './mud-event';
import type MudEventListener from './mud-event-listener';
import type SimpleMap from '../util/simple-map';

export interface MudEventEmitterInterface {
    dispatch: <T = unknown>(event: MudEvent<T>) => void;
    listen: <T = unknown>(
        eventKey: string,
        listener: MudEventListener<[MudEventEmitterInterface, T, SimpleMap | null | undefined]>,
        config?: SimpleMap | null
    ) => void;
    stopListening: (eventKey?: string) => void;
}

export default MudEventEmitterInterface;
