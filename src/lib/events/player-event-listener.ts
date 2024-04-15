import type MudEventListener from './mud-event-listener.js';
import type Player from '../players/player.js';

export type PlayerEventListener<T> = MudEventListener<[Player, T]>;

export default PlayerEventListener;
