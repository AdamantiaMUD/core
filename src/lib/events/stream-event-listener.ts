import type {EventEmitter} from 'events';

import type TransportStream from '../communication/transport-stream';

export type StreamEventListener<T> = (socket: TransportStream<EventEmitter>, args: T) => void;

export default StreamEventListener;
