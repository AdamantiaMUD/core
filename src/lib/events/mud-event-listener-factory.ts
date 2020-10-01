import type GameState from '../game-state';
import type {MudEventListener} from './mud-event-listener';

export interface MudEventListenerFactory<T> {
    name: string;
    listener: (state?: GameState) => MudEventListener<T>;
}
