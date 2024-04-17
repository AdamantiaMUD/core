import type Character from '../../characters/character.js';

import CombatError from './combat-error.js';

/**
 * Error used when trying to attack a pacifist flagged NPC
 */
export class CombatPacifistError extends CombatError {
    public target: Character;

    public constructor(message: string, target: Character) {
        super(message);

        this.target = target;
    }
}

export default CombatPacifistError;
