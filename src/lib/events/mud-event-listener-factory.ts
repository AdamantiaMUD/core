import type GameStateData from '../game-state-data';
import type MudEventListener from './mud-event-listener';

export type StatefulListenerFactory<T extends unknown[]> = (state: GameStateData) => MudEventListener<T>;
export type StatelessListenerFactory<T extends unknown[]> = () => MudEventListener<T>;
export type MudEventListenerFactory<T extends unknown[]> = StatefulListenerFactory<T> | StatelessListenerFactory<T>;

export default MudEventListenerFactory;
