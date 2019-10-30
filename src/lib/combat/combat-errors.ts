import Character from '../characters/character';

export class CombatError extends Error {}

/**
 * Error used when a target tries to attack themselves
 */
export class CombatSelfError extends CombatError {}

/**
 * Error used when a combat target is invalid for some reason (doesn't have a
 * hp attribute/whatever)
 */
export class CombatInvalidTargetError extends CombatError {}

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
