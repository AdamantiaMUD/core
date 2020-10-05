import type MudEventListenerDefinition from './mud-event-listener-definition';
import type Player from '../players/player';

export type PlayerEventListenerDefinition<T> = MudEventListenerDefinition<[Player, T]>;

export default PlayerEventListenerDefinition;
