import GameStateData from '../game-state-data';
import MudEventListener from '../events/mud-event-listener';

export interface BehaviorDefinition {
    listeners: {
        [key: string]: (state: GameStateData) => MudEventListener<unknown>;
    };
}

export default BehaviorDefinition;
