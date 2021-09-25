import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';

export interface NpcKilledPayload {
    killer?: Character;
}

export class NpcKilledEvent extends MudEvent<NpcKilledPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'npc-killed';
    public killer?: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default NpcKilledEvent;
