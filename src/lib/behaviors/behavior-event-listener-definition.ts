import type BehaviorEventListenerFactory from './behavior-event-listener-factory';

export interface BehaviorEventListenerDefinition {
    listeners: Record<string, BehaviorEventListenerFactory>;
}

export default BehaviorEventListenerDefinition;
