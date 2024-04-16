import type MudEventListenerDefinition from './mud-event-listener-definition.js';
import type Player from '../players/player.js';

export type PlayerEventListenerDefinition<T> = MudEventListenerDefinition<
    [Player, T]
>;

export default PlayerEventListenerDefinition;
