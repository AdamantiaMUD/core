import {EventEmitter} from 'events';

import GameState from '../game-state';
import TransportStream from '../communication/transport-stream';

export type InputEventListener = (socket: TransportStream<EventEmitter>, ...args: any[]) => void;

export interface InputEventListenerDefinition {
    event: InputEventListenerFactory;
}

export type InputEventListenerFactory = (state?: GameState) => InputEventListener;
