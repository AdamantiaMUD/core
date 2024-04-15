import type Ability from './ability.js';
import type Character from '../characters/character.js';

export type AbilityRunner = (
    skill: Ability,
    args: string | null,
    source: Character,
    target: Character | null
) => false | undefined;

export default AbilityRunner;
