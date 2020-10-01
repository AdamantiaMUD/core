import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';

export interface NpcKilledPayload {
    killer?: Character;
}

export class NpcKilledEvent extends MudEvent<NpcKilledPayload> {
    public NAME: string = 'npc-killed';
    public killer?: Character;
}

export default NpcKilledEvent;
