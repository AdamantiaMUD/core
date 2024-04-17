import type Player from '../players/player.js';

import type MudEventListenerDefinition from './mud-event-listener-definition.js';

export type PlayerEventListenerDefinition<T> = MudEventListenerDefinition<
    [Player, T]
>;

export default PlayerEventListenerDefinition;
