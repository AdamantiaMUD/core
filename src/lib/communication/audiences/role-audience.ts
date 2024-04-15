import ChannelAudience from './channel-audience.js';

import type Player from '../../players/player.js';
import type PlayerRole from '../../players/player-role.js';

export class RoleAudience extends ChannelAudience {
    public minRole: PlayerRole;

    public constructor(minRole: PlayerRole) {
        super();

        this.minRole = minRole;
    }

    public getBroadcastTargets(): Player[] {
        return this.state
            ?.playerManager
            .filter((player: Player) => player.role >= this.minRole && player !== this.sender) ?? [];
    }
}

export default RoleAudience;
