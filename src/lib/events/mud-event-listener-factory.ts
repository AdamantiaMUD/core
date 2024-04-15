import type GameStateData from '../game-state-data.js';
import type MudEventListener from './mud-event-listener.js';

export type StatefulListenerFactory<T extends unknown[]> = (state: GameStateData) => MudEventListener<T>;
export type StatelessListenerFactory<T extends unknown[]> = () => MudEventListener<T>;
export type MudEventListenerFactory<T extends unknown[]> = StatefulListenerFactory<T> | StatelessListenerFactory<T>;

export default MudEventListenerFactory;
