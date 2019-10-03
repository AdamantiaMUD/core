import GameState from '../game-state';
import Player from '../players/player';

export type PlayerEventListener = (player: Player, ...args: any[]) => void;

export type PlayerEventListenerFactory = (state?: GameState) => PlayerEventListener;

export interface PlayerEventListenersDefinition {
    listeners: {[key: string]: PlayerEventListenerFactory};
}
