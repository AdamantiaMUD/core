import type Attribute from '../../attributes/attribute.js';
import MudEvent from '../../events/mud-event.js';

export interface CharacterAttributeUpdatePayload {
    attr: string;
    value: Attribute | number;
}

export class CharacterAttributeUpdateEvent extends MudEvent<CharacterAttributeUpdatePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'attribute-update';
    public attr!: string;
    public value!: Attribute | number;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterAttributeUpdateEvent;
