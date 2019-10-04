import GameState from '../game-state';
import Player from '../players/player';

export type PlayerEventListener = (player: Player, ...args: any[]) => void;

export interface PlayerEventListenerFactory {
    name: string;
    listener: (state?: GameState) => PlayerEventListener;
}
