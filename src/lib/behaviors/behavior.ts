import GameState from '../game-state';
import SimpleMap from '../util/simple-map';
import {MudEventListener} from '../events/mud-event';

export type Behavior = (config: SimpleMap, ...args: unknown[]) => void;

export interface BehaviorDefinition {
    listeners: {
        [key: string]: (state: GameState) => MudEventListener<unknown>;
    };
}

export type BehaviorEventListenerFactory<T> = (state?: GameState) => MudEventListener<T>;

export interface BehaviorEventListenerDefinition {
    listeners: {[key: string]: BehaviorEventListenerFactory<unknown>};
}
