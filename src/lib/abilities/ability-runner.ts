import type Ability from './ability';
import type CharacterInterface from '../characters/character-interface';

export type AbilityRunner = (
    skill: Ability,
    args: string | null,
    source: CharacterInterface,
    target: CharacterInterface | null
) => undefined | false;

export default AbilityRunner;
