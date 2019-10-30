import AbilityErrors from './ability-errors';
import AbilityFlag from './ability-flag';
import AbilityType from './ability-type';
import Broadcast from '../communication/broadcast';
import Character from '../characters/character';
import Damage from '../combat/damage';
import Effect from '../effects/effect';
import GameState from '../game-state';
import Player from '../players/player';
import SimpleMap from '../util/simple-map';
import {EffectDefinition} from '../effects/effect-factory';

const {sayAt} = Broadcast;

export interface AbilityDefinition {
    configureEffect?: (effect: Effect) => Effect;
    cooldown?: number | {group: string; length: number};
    effect?: string;
    flags?: AbilityFlag[];
    info?: (skill?: Ability, player?: Player) => string;
    initiatesCombat: boolean;
    name: string;
    options: SimpleMap;
    requiresTarget: boolean;
    resource?: AbilityResource | AbilityResource[];
    run?: (state?: GameState) => AbilityRunner;
    targetSelf: boolean;
    type: AbilityType;
}

export interface AbilityResource {
    attribute: string;
    cost: number;
}

export type AbilityRunner = (
    skill: Ability,
    args: string,
    source: Character,
    target?: Character
) => void | false;

export class Ability {
    /* eslint-disable lines-between-class-members */
    public configureEffect: (effect: Effect) => Effect;
    public cooldownGroup: string;
    public cooldownLength: number;
    public effect: string;
    public flags: AbilityFlag[];
    public id: string;
    public info: (skill?: Ability, player?: Character) => string;
    public initiatesCombat: boolean;
    public lag: number = -1;
    public name: string;
    public options: SimpleMap;
    public requiresTarget: boolean;
    public resource: AbilityResource | AbilityResource[];
    public run: AbilityRunner;
    public state: GameState;
    public targetSelf: boolean;
    public type: AbilityType;
    /* eslint-enable lines-between-class-members */

    public constructor(id: string, def: AbilityDefinition, state: GameState) {
        const {
            configureEffect = a => a,
            cooldown = 0,
            effect = null,
            flags = [],
            info = (skill: Ability, player: Character) => player.name,
            initiatesCombat = false,
            name,
            requiresTarget = true,
            resource = null,
            run = () => false,
            targetSelf = false,
            type = AbilityType.SKILL,
            options = {},
        } = def;

        this.configureEffect = configureEffect;

        this.cooldownGroup = null;
        if (typeof cooldown === 'object') {
            this.cooldownGroup = cooldown.group;
            this.cooldownLength = cooldown.length;
        }
        else {
            this.cooldownLength = cooldown;
        }

        this.effect = effect;
        this.flags = flags;
        this.id = id;
        this.info = info.bind(this);
        this.initiatesCombat = initiatesCombat;
        this.name = name;
        this.options = options;
        this.requiresTarget = requiresTarget;
        this.resource = resource;
        this.run = run.bind(this);
        this.state = state;
        this.targetSelf = targetSelf;
        this.type = type;
    }

    public activate(character: Character): void {
        if (!this.flags.includes(AbilityFlag.PASSIVE)) {
            return;
        }

        if (!this.effect) {
            throw new Error('Passive skill has no attached effect');
        }

        let effect = this.state
            .effectFactory
            .create(
                this.effect,
                {
                    name: this.name,
                    description: this.info(this, character),
                },
                this.state
            );

        effect = this.configureEffect(effect);
        effect.ability = this;

        character.addEffect(effect);

        this.run(this, null, character);
    }

    /**
     * Put this skill on cooldown
     */
    public cooldown(character: Character): void {
        if (!this.cooldownLength) {
            return;
        }

        character.addEffect(this.createCooldownEffect());
    }

    /**
     * Create an instance of the cooldown effect for use by cooldown()
     */
    private createCooldownEffect(): Effect {
        if (!this.state.effectFactory.has('cooldown')) {
            this.state
                .effectFactory
                .add('cooldown', this.getDefaultCooldownConfig(), this.state);
        }

        const effect = this.state
            .effectFactory
            .create(
                'cooldown',
                {
                    name: `Cooldown: ${this.name}`,
                    duration: this.cooldownLength * 1000,
                },
                {cooldownId: this.getCooldownId()}
            );

        effect.ability = this;

        return effect;
    }

    /**
     * perform an active skill
     */
    public execute(args: string, actor: Character, target: Character = null): void {
        if (this.flags.includes(AbilityFlag.PASSIVE)) {
            throw new AbilityErrors.PassiveError();
        }

        const cdEffect = this.onCooldown(actor);

        if (this.cooldownLength && cdEffect) {
            throw new AbilityErrors.CooldownError(cdEffect);
        }

        if (this.resource) {
            if (!this.hasEnoughResources(actor)) {
                throw new AbilityErrors.NotEnoughResourcesError();
            }
        }

        if (target !== actor && this.initiatesCombat) {
            actor.combat.initiate(target);
        }

        // allow abilities to not incur the cooldown if they return false in run
        if (this.run(this, args, actor, target) === false) {
            return;
        }

        this.cooldown(actor);
        if (this.resource) {
            this.payResourceCosts(actor);
        }
    }

    public getCooldownId(): string {
        return this.cooldownGroup
            ? `skillgroup:${this.cooldownGroup}`
            : `skill:${this.id}`;
    }

    public getDefaultCooldownConfig(): EffectDefinition {
        return {
            config: {
                name: 'Cooldown',
                description: 'Cannot use ability while on cooldown.',
                unique: false,
                type: 'cooldown',
            },
            state: {
                cooldownId: null,
            },
            listeners: {
                effectDeactivated: (effect: Effect) => {
                    if (effect.target instanceof Player) {
                        /* eslint-disable-next-line max-len */
                        sayAt(effect.target, `You may now use <b>${effect.ability.name}</b> again.`);
                    }
                },
            },
        };
    }

    public hasEnoughResource(
        character: Character,
        resource: {attribute: string; cost: number}
    ): boolean {
        return resource.cost === 0
            || (
                character.attributes.has(resource.attribute)
                && character.getAttribute(resource.attribute) >= resource.cost
            );
    }

    public hasEnoughResources(character: Character): boolean {
        if (Array.isArray(this.resource)) {
            return this.resource.every(resource => this.hasEnoughResource(character, resource));
        }

        return this.hasEnoughResource(character, this.resource);
    }

    public onCooldown(character: Character): Effect | false {
        for (const effect of character.effects.entries()) {
            if (effect.id === 'cooldown' && effect.state.cooldownId === this.getCooldownId()) {
                return effect;
            }
        }

        return false;
    }

    // Helper to pay a single resource cost.
    public payResourceCost(character: Character, resource): boolean {
        /*
         * Resource cost is calculated as the character damaging themselves, so
         * effects could potentially reduce resource costs
         */
        const damage = new Damage(
            resource.attribute,
            resource.cost,
            character,
            this,
            {hidden: true}
        );

        damage.commit(character);

        return true;
    }

    public payResourceCosts(character: Character): boolean {
        const hasMultipleResourceCosts = Array.isArray(this.resource);

        if (hasMultipleResourceCosts) {
            for (const resourceCost of this.resource as []) {
                this.payResourceCost(character, resourceCost);
            }

            return true;
        }

        return this.payResourceCost(character, this.resource);
    }
}

export default Ability;
