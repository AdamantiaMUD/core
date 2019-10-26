import Party from './party';
import Player from '../players/player';

/**
 * Keeps track of active in game parties and is used to create new parties
 */
export class PartyManager extends Set<Party> {
    /**
     * Create a new party from with a given leader
     */
    public create(leader: Player): void {
        const party = new Party(leader);

        this.add(party);
    }

    public disband(party: Party): void {
        party.disband();

        this.delete(party);

        /* eslint-disable-next-line no-param-reassign */
        party = null;
    }
}

export default PartyManager;
