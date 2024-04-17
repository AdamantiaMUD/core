import MudEvent from '../../events/mud-event.js';
import type RoomExitDefinition from '../../locations/room-exit-definition.js';

export interface PlayerMovePayload {
    roomExit: RoomExitDefinition;
}

export class PlayerMoveEvent extends MudEvent<PlayerMovePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'move';
    public roomExit!: RoomExitDefinition;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerMoveEvent;
