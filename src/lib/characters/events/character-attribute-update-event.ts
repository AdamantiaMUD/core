import MudEvent from '../../events/mud-event';

import type Attribute from '../../attributes/attribute';

export interface CharacterAttributeUpdatePayload {
    attr: string;
    value: number | Attribute;
}

export class CharacterAttributeUpdateEvent extends MudEvent<CharacterAttributeUpdatePayload> {
    public NAME: string = 'attribute-update';
    public attr: string;
    public value: number | Attribute;
}

export default CharacterAttributeUpdateEvent;
