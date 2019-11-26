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
        for (const [id, ability] of this._abilities) {
            if (!includePassive && ability.flags.includes(AbilityFlag.PASSIVE)) {
                // no-op
            }
            else if (id.startsWith(search)) {
                return ability;
            }
        }

        return undefined;
    }

    public get(id: string): Ability {
        return this._abilities.get(id);
    }

    public remove(ability: Ability): void {
        this._abilities.delete(ability.id);
    }
}

export default AbilityManager;
