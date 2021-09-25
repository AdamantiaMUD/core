import type GameStateData from '../game-state-data';
import type MudEventListener from '../events/mud-event-listener';

/* eslint-disable-next-line max-len */
export type BehaviorEventListenerFactory<T extends unknown[] = unknown[]> = (state?: GameStateData) => MudEventListener<T>;

export default BehaviorEventListenerFactory;
