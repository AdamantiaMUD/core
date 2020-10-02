import type GameStateData from '../game-state-data';
import type MudEventListener from '../events/mud-event-listener';

export type BehaviorEventListenerFactory<T> = (state?: GameStateData) => MudEventListener<T>;

export default BehaviorEventListenerFactory;
