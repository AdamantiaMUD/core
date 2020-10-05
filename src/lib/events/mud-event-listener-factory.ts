import type GameStateData from '../game-state-data';
import type MudEventListener from './mud-event-listener';

export type MudEventListenerFactory<T extends unknown[]> = (state?: GameStateData) => MudEventListener<T>;

export default MudEventListenerFactory;
