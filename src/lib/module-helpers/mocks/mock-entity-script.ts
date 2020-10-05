import type MudEventListenerFactory from '../../events/mud-event-listener-factory';

const mockScript: {
    listeners: {
        [key: string]: MudEventListenerFactory<unknown[]>;
    };
} = {listeners: {}};

export default mockScript;
