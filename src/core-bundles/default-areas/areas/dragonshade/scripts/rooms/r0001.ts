import Broadcast from '../../../../../../lib/communication/broadcast';
import Player from '../../../../../../lib/players/player';
import Room from '../../../../../../lib/locations/room';
import {BehaviorDefinition} from '../../../../../../lib/behaviors/behavior';

const {sayAt} = Broadcast;

const r0001: BehaviorDefinition = {
    listeners: {
        command: () => (room: Room, player: Player, commandName: string) => {
            if (commandName !== 'begin') {
                sayAt(player, 'Huh?');

                return;
            }

            /* eslint-disable-next-line max-len */
            sayAt(player, `You just executed room context command '${commandName}'`);
        },
    },
};

export default r0001;
