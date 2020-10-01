import MudEvent from '../../events/mud-event';

interface MetadataUpdatedPayload {
    key: string;
    newValue: unknown;
    oldValue: unknown;
}

export class MetadataUpdatedEvent extends MudEvent<MetadataUpdatedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'metadata-updated';
    public key: string;
    public newValue: unknown;
    public oldValue: unknown;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default MetadataUpdatedEvent;
