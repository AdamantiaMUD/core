import cloneFactory from 'rfdc';

import Effect, {EffectConfig} from './effect';
import EffectFlag from './effect-flag';
import GameState from '../game-state';
import MudEventManager from '../events/mud-event-manager';
import SimpleMap from '../util/simple-map';
import {EffectModifiers} from './effect-modifiers';

const clone = cloneFactory();

export interface EffectDefinition {
    config: EffectConfig;
    flags?: EffectFlag[];
    listeners?: EffectListenersDefinition | EffectListenersDefinitionFactory;
    modifiers?: EffectModifiers;
    state?: SimpleMap;
}

export interface EffectListenersDefinition {
    effectActivated?: (effect?: Effect) => void;
    effectAdded?: (effect?: Effect) => void;
    effectDeactivated?: (effect?: Effect) => void;
    effectRefreshed?: (effect?: Effect) => void;
    [key: string]: (effect?: Effect, ...args: unknown[]) => void;
}

export type EffectListenersDefinitionFactory = (state: GameState) => EffectListenersDefinition;

export class EffectFactory {
    /* eslint-disable lines-between-class-members */
    public effects: Map<
    string,
    {definition: EffectDefinition; eventManager: MudEventManager}
    > = new Map();
    /* eslint-enable lines-between-class-members */

    public add(id: string, config: EffectDefinition, state: GameState): void {
        if (this.effects.has(id)) {
            return;
        }

        const definition = clone(config);

        delete definition.listeners;
        let listeners = config.listeners || {};

        if (typeof listeners === 'function') {
            listeners = listeners(state);
        }

        const eventManager = new MudEventManager();

        for (const event in listeners) {
            eventManager.add(event, listeners[event]);
        }

        this.effects.set(id, {definition, eventManager});
    }

    public create(
        id: string,
        config: EffectConfig = {} as EffectConfig,
        state: SimpleMap = {}
    ): Effect {
        const entry = this.effects.get(id);

        if (!entry || !entry.definition) {
            throw new Error(`No valid entry definition found for effect ${id}.`);
        }

        const def = clone(entry.definition);

        def.config = {...def.config, ...config};
        def.state = {...def.state, ...state};

        const effect = new Effect(id, def);

        entry.eventManager.attach(effect);

        return effect;
    }

    /**
     * Get a effect definition. Use `create` if you want an instance of a effect
     */
    public get(id: string): {definition: EffectDefinition; eventManager: MudEventManager} {
        return this.effects.get(id);
    }

    public has(id: string): boolean {
        return this.effects.has(id);
    }
}

export default EffectFactory;
