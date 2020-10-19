export interface RoomExitDefinition {
    // @TODO: make directions an enum
    direction: string;
    leaveMessage?: string;
    roomId: string;
}

export default RoomExitDefinition;
