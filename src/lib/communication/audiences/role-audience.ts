import ChannelAudience from './channel-audience';
import Player from '../../players/player';
import PlayerRole from '../../players/player-role';

export class RoleAudience extends ChannelAudience {
    public minRole: PlayerRole;

    public constructor(minRole: PlayerRole) {
        super();

        this.minRole = minRole;
    }

    public getBroadcastTargets(): Player[] {
        return this.state
            .playerManager
            .filter(player => player.role >= this.minRole && player !== this.sender);
    }
}

export default RoleAudience;
