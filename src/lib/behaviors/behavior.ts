import GameState from '../game-state';
import SimpleMap from '../util/simple-map';
import {MudEventListener} from '../events/mud-event';

export type Behavior = (config: SimpleMap, ...args: any[]) => void;

export interface BehaviorDefinition {
    listeners: {
        [key: string]: <T>(state: GameState) => MudEventListener<T>;
    };
}

export type BehaviorEventListenerFactory<T> = (state?: GameState) => MudEventListener<T>;

export interface BehaviorEventListenerDefinition {
    listeners: {[key: string]: BehaviorEventListenerFactory<any>};
}
