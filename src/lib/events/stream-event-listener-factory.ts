import type GameStateData from '../game-state-data.js';
import type StreamEventListener from './stream-event-listener.js';

export interface StreamEventListenerFactory<T> {
    name: string;
    listener: (() => StreamEventListener<T>) | ((state: GameStateData) => StreamEventListener<T>);
}

export default StreamEventListenerFactory;
