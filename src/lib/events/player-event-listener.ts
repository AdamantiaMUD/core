import type MudEventListener from './mud-event-listener';
import type Player from '../players/player';

export type PlayerEventListener<T> = MudEventListener<[Player, T]>;

export default PlayerEventListener;
