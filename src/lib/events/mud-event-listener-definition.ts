import type MudEventListenerFactory from './mud-event-listener-factory';

export interface MudEventListenerDefinition<T extends unknown[]> {
    name: string;
    listener: MudEventListenerFactory<T>;
}

export default MudEventListenerDefinition;
