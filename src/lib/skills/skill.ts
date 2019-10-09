import Broadcast from '../communication/broadcast';
import Character from '../entities/character';
import Damage from '../combat/damage';
import Effect from '../effects/effect';
import {EffectDefinition} from '../effects/effect-factory';
import GameState from '../game-state';
import Player from '../players/player';
import SkillErrors from './skill-errors';
import SkillFlag from './skill-flag';
import SkillType from './skill-type';
import {SimpleMap} from '../../../index';

const {sayAt} = Broadcast;

export interface SkillDefinition {
    configureEffect?: (effect: Effect) => Effect;
    cooldown?: number | {group: string; length: number};
    effect?: string;
    flags?: SkillFlag[];
    info?: (skill?: Skill, player?: Player) => string;
    initiatesCombat: boolean;
    name: string;
    options: SimpleMap;
    requiresTarget: boolean;
    resource?: SkillResource | SkillResource[];
    run?: (state?: GameState) => SkillRunner;
    targetSelf: boolean;
    type: SkillType;
}

export interface SkillResource {
    attribute: string;
    cost: number;
}

export type SkillRunner = (
    skill: Skill,
    args: string,
    source: Character,
    target?: Character
) => void | false;

export class Skill {
    /* eslint-disable lines-between-class-members */
    public configureEffect: (effect: Effect) => Effect;
    public cooldownGroup: string;
    public cooldownLength: number;
    public effect: string;
    public flags: SkillFlag[];
    public id: string;
    public info: (skill?: Skill, player?: Character) => string;
    public initiatesCombat: boolean;
    public lag: number = -1;
    public name: string;
    public options: SimpleMap;
    public requiresTarget: boolean;
    public resource: SkillResource | SkillResource[];
    public run: SkillRunner;
    public state: GameState;
    public targetSelf: boolean;
    public type: SkillType;
    /* eslint-enable lines-between-class-members */

    public constructor(id: string, def: SkillDefinition, state: GameState) {
        const {
            configureEffect = a => a,
            cooldown = 0,
            effect = null,
            flags = [],
            info = (skill: Skill, player: Character) => player.name,
            initiatesCombat = false,
            name,
            requiresTarget = true,
            resource = null,
            run = () => false,
            targetSelf = false,
            type = SkillType.SKILL,
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

    public activate(player: Character): void {
        if (!this.flags.includes(SkillFlag.PASSIVE)) {
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
                    description: this.info(this, player),
                },
                this.state
            );

        effect = this.configureEffect(effect);
        effect.skill = this;

        player.addEffect(effect);

        this.run(this, null, player);
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

        effect.skill = this;

        return effect;
    }

    /**
     * perform an active skill
     */
    public execute(args: string, player: Character, target: Character = null): void {
        if (this.flags.includes(SkillFlag.PASSIVE)) {
            throw new SkillErrors.PassiveError();
        }

        const cdEffect = this.onCooldown(player);

        if (this.cooldownLength && cdEffect) {
            throw new SkillErrors.CooldownError(cdEffect);
        }

        if (this.resource) {
            if (!this.hasEnoughResources(player)) {
                throw new SkillErrors.NotEnoughResourcesError();
            }
        }

        if (target !== player && this.initiatesCombat) {
            player.initiateCombat(target);
        }

        // allow skills to not incur the cooldown if they return false in run
        if (this.run(this, args, player, target) === false) {
            return;
        }

        this.cooldown(player);
        if (this.resource) {
            this.payResourceCosts(player);
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
                        sayAt(effect.target, `You may now use <b>${effect.skill.name}</b> again.`);
                    }
                },
            },
        };
    }

    public hasEnoughResource(
        char: Character,
        resource: {attribute: string; cost: number}
    ): boolean {
        return resource.cost === 0
            || (
                char.hasAttribute(resource.attribute)
                && char.getAttribute(resource.attribute) >= resource.cost
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
    public payResourceCost(player: Character, resource): boolean {
        /*
         * Resource cost is calculated as the player damaging themselves, so
         * effects could potentially reduce resource costs
         */
        const damage = new Damage(
            resource.attribute,
            resource.cost,
            player,
            this,
            {hidden: true}
        );

        damage.commit(player);

        return true;
    }

    public payResourceCosts(player: Character): boolean {
        const hasMultipleResourceCosts = Array.isArray(this.resource);

        if (hasMultipleResourceCosts) {
            for (const resourceCost of this.resource as []) {
                this.payResourceCost(player, resourceCost);
            }

            return true;
        }

        return this.payResourceCost(player, this.resource);
    }
}

export default Skill;
