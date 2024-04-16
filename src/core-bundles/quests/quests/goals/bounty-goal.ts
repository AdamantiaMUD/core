import QuestGoal from '../../../../lib/quests/quest-goal.js';
import { PlayerEnterRoomEvent } from '../../../../lib/players/events/index.js';
import { QuestProgressEvent } from '../../../../lib/quests/events/index.js';
import { hasValue } from '../../../../lib/util/functions.js';

import type Player from '../../../../lib/players/player.js';
import type Quest from '../../../../lib/quests/quest.js';
import type QuestProgress from '../../../../lib/quests/quest-progress.js';
import type SimpleMap from '../../../../lib/util/simple-map.js';
import type { PlayerEnterRoomPayload } from '../../../../lib/players/events/index.js';

interface BountyGoalConfig extends SimpleMap {
    title: string;

    // NPC ID to capture
    npc: string;

    // Area ID to return to
    home?: string;
}

interface BountyGoalState extends SimpleMap {
    delivered: boolean;
    found: boolean;
}

export class BountyGoal extends QuestGoal<BountyGoalConfig, BountyGoalState> {
    public constructor(quest: Quest, config: BountyGoalConfig, player: Player) {
        super(quest, config, player);

        this.state = {
            delivered: false,
            found: false,
        };

        this.listen(PlayerEnterRoomEvent.getName(), this._enterRoom.bind(this));
    }

    private _enterRoom(player: Player, payload: PlayerEnterRoomPayload): void {
        const { room } = payload;

        if (this.state.found) {
            if (room.entityReference === this.config.home) {
                // Check if we have taken the NPC home
                this.state.delivered = true;
            }
            this.dispatch(
                new QuestProgressEvent({ progress: this.getProgress() })
            );
        } else {
            const goalNpcId = this.config.npc;

            let isLocated = false;

            for (const npc of room.npcs) {
                if (npc.entityReference === goalNpcId) {
                    isLocated = true;
                    npc.follow(this.player);
                }
            }

            if (isLocated) {
                this.state.found = true;
            }

            this.dispatch(
                new QuestProgressEvent({ progress: this.getProgress() })
            );
        }
    }

    public getProgress(): QuestProgress {
        // Has target been located?
        let percent = this.state.found ? 50 : 0;

        if (hasValue(this.config.home)) {
            // Has target been returned home?
            percent += this.state.delivered ? 50 : 0;
        } else {
            // No return location necessary.
            percent += 50;
        }

        const display = this.state.found ? 'Complete' : 'Not Complete';

        return { percent, display };
    }
}

export default BountyGoal;
