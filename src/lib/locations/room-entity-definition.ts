export interface RoomEntityDefinition {
    id: string;
    maxLoad?: number;
    replaceOnRespawn?: boolean;
    respawnChance?: number;
}

export default RoomEntityDefinition;
