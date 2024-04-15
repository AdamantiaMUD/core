import type BehaviorEventListenerFactory from './behavior-event-listener-factory.js';

export interface BehaviorEventListenerDefinition {
    listeners: Record<string, BehaviorEventListenerFactory>;
}

export default BehaviorEventListenerDefinition;
