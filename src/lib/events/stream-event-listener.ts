import type { EventEmitter } from 'events';

import type TransportStream from '../communication/transport-stream.js';

export type StreamEventListener<T> = (
    socket: TransportStream<EventEmitter>,
    args: T
) => void | Promise<void>;

export default StreamEventListener;
