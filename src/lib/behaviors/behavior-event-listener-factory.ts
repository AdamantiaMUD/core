import type MudEventListener from '../events/mud-event-listener.js';
import type GameStateData from '../game-state-data.js';

/* eslint-disable-next-line max-len */
export type BehaviorEventListenerFactory<T extends unknown[] = unknown[]> = (
    state?: GameStateData
) => MudEventListener<T>;

export default BehaviorEventListenerFactory;
