import type MudEventListener from '../events/mud-event-listener.js';
import type GameStateData from '../game-state-data.js';

export interface BehaviorDefinition {
    listeners: Record<string, (state: GameStateData) => MudEventListener>;
}

export default BehaviorDefinition;
