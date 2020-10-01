import type MudEventEmitter from './mud-event-emitter';
import type SimpleMap from '../util/simple-map';

type MudEventListener<T> = (emitter: MudEventEmitter, args?: T, config?: SimpleMap) => void;

export default MudEventListener;
