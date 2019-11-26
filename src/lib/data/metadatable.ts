import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface Metadatable {
    getMeta: (key: string) => unknown;
    setMeta: (key: string, value: unknown) => void;
}

interface MetadataUpdatedPayload {
    key: string;
    newValue: unknown;
    oldValue: unknown;
}

export const MetadataUpdatedEvent: MudEventConstructor<MetadataUpdatedPayload> = class MetadataUpdatedEvent extends MudEvent<MetadataUpdatedPayload> {
    public NAME: string = 'metadata-updated';

    public key: string;
    public newValue: unknown;
    public oldValue: unknown;
};

export default Metadatable;
