import AbilityFlag from './ability-flag';
import AbilityType from './ability-type';
import Broadcast from '../communication/broadcast';
import Damage from '../combat/damage';
import Player from '../players/player';
import {CooldownError, NotEnoughResourcesError, PassiveError} from './errors';
import {hasValue, ident, noop} from '../util/functions';

import type AbilityDefinition from './ability-definition';
import type AbilityResource from './ability-resource';
import type AbilityRunner from './ability-runner';
import type CharacterInterface from '../characters/character-interface';
import type Effect from '../effects/effect';
import type EffectDefinition from '../effects/effect-definition';
import type GameStateData from '../game-state-data';
import type SimpleMap from '../util/simple-map';

const {sayAt} = Broadcast;

export const ABILITY_DEFAULTS: AbilityDefinition = {
    canTargetSelf: false,
    configureEffect: null,
    cooldown: 0,
    effect: null,
    flags: [],
    info: (skill: Ability, player: CharacterInterface | undefined) => player?.name ?? skill.name,
    initiatesCombat: false,
    name: '',
    requiresTarget: true,
    resource: null,
    run: () => noop,
    type: AbilityType.SKILL,
    options: {},
};

export class Ability {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public canTargetSelf: boolean;
    public configureEffect: (effect: Effect) => Effect;
    public cooldownGroup: string | null;
    public cooldownLength: number;
    public effect: string | null;
    public flags: AbilityFlag[];
    public id: string;
    public info: (skill?: Ability, player?: CharacterInterface) => string;
    public initiatesCombat: boolean;
    public lag: number = -1;
    public name: string;
    public options: SimpleMap;
    public requiresTarget: boolean;
    public resource: AbilityDefinition['resource'];
    public run: AbilityRunner;
    public state: GameStateData;
    public type: AbilityType;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(id: string, def: AbilityDefinition, state: GameStateData) {
        const config: AbilityDefinition = {
            ...ABILITY_DEFAULTS,
            ...def,
        };

        const {
            canTargetSelf,
            configureEffect,
            cooldown,
            effect,
            flags,
            info,
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            initiatesCombat,
            name,
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            requiresTarget,
            resource,
            run,
            type,
            options,
        } = config;

        this.configureEffect = configureEffect ?? ident;

        this.cooldownGroup = null;

        if (typeof cooldown === 'number') {
            this.cooldownLength = cooldown;
        }
        else if (hasValue(cooldown)) {
            this.cooldownGroup = cooldown.group;
            this.cooldownLength = cooldown.length;
        }
        else {
            this.cooldownLength = 0;
        }

        this.effect = effect ?? null;
        this.flags = flags ?? [];
        this.id = id;
        this.info = info!.bind(this) as Ability['info'];
        this.initiatesCombat = initiatesCombat;
        this.name = name;
        this.options = options;
        this.requiresTarget = requiresTarget;
        this.resource = resource;
        this.run = (run ?? noop).bind(this) as AbilityRunner;
        this.state = state;
        this.canTargetSelf = canTargetSelf;
        this.type = type;
    }

    public activate(character: CharacterInterface): void {
        if (!this.flags.includes(AbilityFlag.PASSIVE)) {
            return;
        }

        if (!hasValue(this.effect)) {
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

        this.run(this, null, character, null);
    }

    /**
     * Put this skill on cooldown
     */
    public cooldown(character: CharacterInterface): void {
        if (!hasValue(this.cooldownLength) || this.cooldownLength === 0) {
            return;
        }

        character.addEffect(this._createCooldownEffect());
    }

    /**
     * Create an instance of the cooldown effect for use by cooldown()
     */
    private _createCooldownEffect(): Effect {
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
    public execute(args: string, actor: CharacterInterface, target: CharacterInterface | null = null): void {
        if (this.flags.includes(AbilityFlag.PASSIVE)) {
            throw new PassiveError();
        }

        const cdEffect = this.onCooldown(actor);

        if (hasValue(this.cooldownLength) && hasValue(cdEffect)) {
            throw new CooldownError(cdEffect);
        }

        if (hasValue(this.resource)) {
            if (!this.hasEnoughResources(actor)) {
                throw new NotEnoughResourcesError();
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

        if (hasValue(this.resource)) {
            this.payResourceCosts(actor);
        }
    }

    public getCooldownId(): string {
        return hasValue(this.cooldownGroup)
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
                effectDeactivated: (effect: Effect): void => {
                    if (effect.target instanceof Player) {
                        sayAt(effect.target, `You may now use {bold ${effect.ability!.name}} again.`);
                    }
                },
            },
        };
    }

    public hasEnoughResource(character: CharacterInterface, resource: AbilityResource): boolean {
        return resource.cost === 0
            || (
                character.attributes.has(resource.attribute)
                && character.getAttribute(resource.attribute) >= resource.cost
            );
    }

    public hasEnoughResources(character: CharacterInterface): boolean {
        if (!hasValue(this.resource)) {
            return true;
        }

        if (Array.isArray(this.resource)) {
            return this.resource
                .every((resource: AbilityResource) => this.hasEnoughResource(character, resource));
        }

        return this.hasEnoughResource(character, this.resource);
    }

    public onCooldown(character: CharacterInterface): Effect | undefined {
        for (const effect of character.effects.entries()) {
            if (effect.id === 'cooldown' && effect.state.cooldownId === this.getCooldownId()) {
                return effect;
            }
        }

        return undefined;
    }

    // Helper to pay a single resource cost.
    public payResourceCost(character: CharacterInterface, resource: AbilityResource): boolean {
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

    public payResourceCosts(character: CharacterInterface): boolean {
        if (!hasValue(this.resource)) {
            return true;
        }

        if (Array.isArray(this.resource)) {
            for (const resourceCost of this.resource) {
                this.payResourceCost(character, resourceCost);
            }

            return true;
        }

        return this.payResourceCost(character, this.resource);
    }
}

export default Ability;
