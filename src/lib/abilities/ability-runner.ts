import type Ability from './ability';
import type Character from '../characters/character';

export type AbilityRunner = (
    skill: Ability,
    args: string | null,
    source: Character,
    target: Character | null
) => false | undefined;

export default AbilityRunner;
