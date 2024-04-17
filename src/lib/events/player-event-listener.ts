import type Player from '../players/player.js';

import type MudEventListener from './mud-event-listener.js';

export type PlayerEventListener<T> = MudEventListener<[Player, T]>;

export default PlayerEventListener;
