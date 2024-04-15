import type Player from '../players/player.js';

/**
 * Representation of an adventuring party
 */
export class Party extends Set<Player> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public invited: Set<Player> = new Set();
    public leader: Player;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(leader: Player) {
        super();

        this.leader = leader;
        this.add(leader);
    }

    public add(member: Player): this {
        super.add(member);

        member.setParty(this);
        this.invited.delete(member);

        return this;
    }

    // @TODO: throw an error if trying to delete the leader without disbanding
    public delete(member: Player): boolean {
        super.delete(member);

        member.setParty(null);

        return true;
    }

    public disband(): void {
        for (const member of this) {
            this.delete(member);
        }
    }

    public getBroadcastTargets(): Player[] {
        return [...this];
    }

    public invite(target: Player): void {
        this.invited.add(target);
    }

    public isInvited(target: Player): boolean {
        return this.invited.has(target);
    }

    public removeInvite(target: Player): void {
        this.invited.delete(target);
    }
}

export default Party;
