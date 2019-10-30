import GameState from '../game-state';
import TransportStream from '../communication/transport-stream';
import SimpleMap from '../util/simple-map';
import {MudEventEmitter} from '../events/mud-event';

export type Behavior = (config: SimpleMap, ...args: any[]) => void;

export interface BehaviorDefinition {
    listeners: {
        [key: string]: (state: GameState) => Behavior;
    };
}

export type BehaviorEventListener = (socket: TransportStream<MudEventEmitter>, ...args: any[]) => void;

export type BehaviorEventListenerFactory = (state?: GameState) => BehaviorEventListener;

export interface BehaviorEventListenerDefinition {
    listeners: {[key: string]: BehaviorEventListenerFactory};
}
