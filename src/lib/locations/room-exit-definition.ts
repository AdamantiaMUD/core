import type Direction from './direction';

export interface RoomExitDefinition {
    direction: Direction;
    leaveMessage?: string;
    roomId: string;
}

export default RoomExitDefinition;
