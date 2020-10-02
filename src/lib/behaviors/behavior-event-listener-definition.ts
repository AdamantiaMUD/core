import type BehaviorEventListenerFactory from './behavior-event-listener-factory';

export interface BehaviorEventListenerDefinition {
    listeners: {[key: string]: BehaviorEventListenerFactory<unknown>};
}

export default BehaviorEventListenerDefinition;
