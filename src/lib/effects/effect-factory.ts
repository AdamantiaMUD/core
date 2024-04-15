import Effect from './effect.js';
import MudEventManager from '../events/mud-event-manager.js';
import {clone} from '../util/objects.js';
import {hasValue} from '../util/functions.js';

import type EffectConfig from './effect-config.js';
import type EffectDefinition from './effect-definition.js';
import type EffectInfo from './effect-info.js';
import type GameStateData from '../game-state-data.js';
import type SimpleMap from '../util/simple-map.js';

export class EffectFactory {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public effects: Map<string, EffectInfo> = new Map<string, EffectInfo>();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public add(id: string, config: EffectDefinition, state: GameStateData): void {
        if (this.effects.has(id)) {
            return;
        }

        const definition = clone(config);

        delete definition.listeners;
        let listeners = config.listeners ?? {};

        if (typeof listeners === 'function') {
            listeners = listeners(state);
        }

        const eventManager = new MudEventManager();

        for (const event in listeners) {
            if (Object.prototype.hasOwnProperty.call(listeners, event)) {
                eventManager.add(event, listeners[event]);
            }
        }

        this.effects.set(id, {definition, eventManager});
    }

    public create(
        id: string,
        config: EffectConfig,
        state: SimpleMap = {}
    ): Effect {
        const entry = this.effects.get(id);

        if (!hasValue(entry) || !hasValue(entry.definition)) {
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
    public get(id: string): EffectInfo | null {
        return this.effects.get(id) ?? null;
    }

    public has(id: string): boolean {
        return this.effects.has(id);
    }
}

export default EffectFactory;
