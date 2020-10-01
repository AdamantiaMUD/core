import type Ability from './ability';
import type AbilityResource from './ability-resource';
import type AbilityRunner from './ability-runner';
import type AbilityType from './ability-type';
import type GameState from '../game-state';
import type Player from '../players/player';
import type AbilityFlag from './ability-flag';
import type Effect from '../effects/effect';
import type SimpleMap from '../util/simple-map';

export default interface AbilityDefinition {
    configureEffect?: ((effect: Effect) => Effect) | null;
    cooldown?: number | {group: string; length: number} | null;
    effect?: string | null;
    flags?: AbilityFlag[] | null;
    info?: ((skill?: Ability, player?: Player) => string) | null;
    initiatesCombat: boolean;
    name: string;
    options: SimpleMap;
    requiresTarget: boolean;
    resource?: AbilityResource | AbilityResource[] | null;
    run?: ((state?: GameState) => AbilityRunner) | null;
    targetSelf: boolean;
    type: AbilityType;
}
