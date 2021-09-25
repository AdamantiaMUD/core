import type Room from './room';

/**
 * Keeps track of all the individual rooms in the game
 */
export class RoomManager {
    private readonly _rooms: Map<string, Room> = new Map<string, Room>();

    public get rooms(): Map<string, Room> {
        return this._rooms;
    }

    public addRoom(room: Room): void {
        this._rooms.set(room.entityReference, room);
    }

    public getRoom(entityRef: string): Room | null {
        return this._rooms.get(entityRef) ?? null;
    }

    public removeRoom(room: Room): void {
        this._rooms.delete(room.entityReference);
    }
}

export default RoomManager;
