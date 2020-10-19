import MudEvent from '../../events/mud-event';

import type Ability from '../ability';

export interface UseAbilityPayload {
    args: string;
    ability: Ability;
}

export class UseAbilityEvent extends MudEvent<UseAbilityPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'use-ability';
    public args: string;
    public ability: Ability;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default UseAbilityEvent;
