import type GameStateData from '../game-state-data';
import type MudEventListener from '../events/mud-event-listener';

export interface BehaviorDefinition {
    listeners: Record<string, (state: GameStateData) => MudEventListener>;
}

export default BehaviorDefinition;
