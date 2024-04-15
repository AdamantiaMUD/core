import type Direction from './direction.js';

export interface RoomExitDefinition {
    direction: Direction;
    leaveMessage?: string;
    roomId: string;
}

export default RoomExitDefinition;
