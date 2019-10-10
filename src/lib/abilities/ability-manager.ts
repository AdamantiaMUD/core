import Ability from './ability';
import AbilityFlag from './ability-flag';

/**
 * Keeps track of registered abilities
 */
export class AbilityManager {
    private readonly _abilities: Map<string, Ability> = new Map();

    public add(ability: Ability): void {
        this._abilities.set(ability.id, ability);
    }

    /**
     * Find executable abilities
     */
    public find(search: string, includePassive: boolean = false): Ability {
        for (const [id, skill] of this._abilities) {
            if (!includePassive && skill.flags.includes(AbilityFlag.PASSIVE)) {
                // no-op
            }
            else if (id.indexOf(search) === 0) {
                return skill;
            }
        }

        return undefined;
    }

    public get(ability: string): Ability {
        return this._abilities.get(ability);
    }

    public remove(ability: Ability): void {
        this._abilities.delete(ability.id);
    }
}

export default AbilityManager;
