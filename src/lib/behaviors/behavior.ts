import type GameStateData from '../game-state-data';
import type MudEventListener from '../events/mud-event-listener';
import type SimpleMap from '../util/simple-map';

export type Behavior = (config: SimpleMap, ...args: unknown[]) => void;

export interface BehaviorDefinition {
    listeners: {
        [key: string]: (state: GameStateData) => MudEventListener<unknown>;
    };
}

export type BehaviorEventListenerFactory<T> = (state?: GameStateData) => MudEventListener<T>;

export interface BehaviorEventListenerDefinition {
    listeners: {[key: string]: BehaviorEventListenerFactory<unknown>};
}
