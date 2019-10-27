import Room from './room';

/**
 * Keeps track of all the individual rooms in the game
 */
export class RoomManager {
    private _rooms: Map<string, Room> = new Map();

    public addRoom(room: Room): void {
        this._rooms.set(room.entityReference, room);
    }

    public getRoom(entityRef: string): Room {
        return this._rooms.get(entityRef);
    }

    public removeRoom(room: Room): void {
        this._rooms.delete(room.entityReference);
    }
}

export default RoomManager;
