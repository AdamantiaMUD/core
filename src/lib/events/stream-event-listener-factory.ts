import type GameStateData from '../game-state-data';
import type StreamEventListener from './stream-event-listener';

export interface StreamEventListenerFactory<T> {
    name: string;
    listener: (state?: GameStateData) => StreamEventListener<T>;
}

export default StreamEventListenerFactory;
