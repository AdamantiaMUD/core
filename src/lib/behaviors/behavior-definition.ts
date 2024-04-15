import type GameStateData from '../game-state-data.js';
import type MudEventListener from '../events/mud-event-listener.js';

export interface BehaviorDefinition {
    listeners: Record<string, (state: GameStateData) => MudEventListener>;
}

export default BehaviorDefinition;
