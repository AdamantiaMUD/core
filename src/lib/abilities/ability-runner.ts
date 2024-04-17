import type Character from '../characters/character.js';

import type Ability from './ability.js';

export type AbilityRunner = (
    skill: Ability,
    args: string | null,
    source: Character,
    target: Character | null
) => false | undefined;

export default AbilityRunner;
