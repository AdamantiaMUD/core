import type Effect from '../effects/effect.js';
import type GameState from '../game-state.js';
import type Player from '../players/player.js';
import type SimpleMap from '../util/simple-map.js';

import type AbilityFlag from './ability-flag.js';
import type AbilityResource from './ability-resource.js';
import type AbilityRunner from './ability-runner.js';
import type AbilityType from './ability-type.js';
import type Ability from './ability.js';

export interface AbilityDefinition {
    canTargetSelf: boolean;
    configureEffect?: ((effect: Effect) => Effect) | null;
    cooldown?: number | { group: string; length: number } | null;
    effect?: string | null;
    flags?: AbilityFlag[] | null;
    info?: ((ability: Ability, player: Player) => string) | null;
    initiatesCombat: boolean;
    name: string;
    options: SimpleMap;
    requiresTarget: boolean;
    resource?: AbilityResource | AbilityResource[] | null;
    run?: ((state?: GameState) => AbilityRunner) | null;
    type: AbilityType;
}

export default AbilityDefinition;
