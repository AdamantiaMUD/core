import Room from './room';

/**
 * Keeps track of all the individual rooms in the game
 */
export class RoomManager {
    public rooms: Map<string, Room> = new Map();

    public addRoom(room: Room): void {
        this.rooms.set(room.entityReference, room);
    }

    public getRoom(entityRef: string): Room {
        return this.rooms.get(entityRef);
    }

    public removeRoom(room: Room): void {
        this.rooms.delete(room.entityReference);
    }
}

export default RoomManager;
