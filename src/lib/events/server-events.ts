import GameState from '../game-state';

export type ServerEventListener = (...args: any[]) => void;

export type ServerEventListenerFactory = (state?: GameState) => ServerEventListener;

export interface ServerEventListenersDefinition {
    listeners: {[key: string]: ServerEventListenerFactory};
}
