import type Character from '../../characters/character.js';

import CombatError from './combat-error.js';

/**
 * Error used when trying to attack a non-pvp flagged player
 */
export class CombatNonPvpError extends CombatError {
    public target: Character;

    public constructor(message: string, target: Character) {
        super(message);

        this.target = target;
    }
}

export default CombatNonPvpError;
