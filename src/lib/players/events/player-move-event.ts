import MudEvent from '../../events/mud-event';

import type {RoomExitDefinition} from '../../locations/room';

export interface PlayerMovePayload {
    roomExit: RoomExitDefinition;
}

export class PlayerMoveEvent extends MudEvent<PlayerMovePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'move';
    public roomExit: RoomExitDefinition;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerMoveEvent;