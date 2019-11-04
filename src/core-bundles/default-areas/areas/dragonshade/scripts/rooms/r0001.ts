import Broadcast from '../../../../../../lib/communication/broadcast';
import Room from '../../../../../../lib/locations/room';
import {BehaviorDefinition} from '../../../../../../lib/behaviors/behavior';
import {MudEventListener} from '../../../../../../lib/events/mud-event';
import {RoomCommandPayload} from '../../../../../../lib/locations/room-events';

const {sayAt} = Broadcast;

const r0001: BehaviorDefinition = {
    listeners: {
        command: (): MudEventListener<RoomCommandPayload> => (room: Room, {player, name}) => {
            if (name !== 'begin') {
                sayAt(player, 'Huh?');

                return;
            }

            /* eslint-disable-next-line max-len */
            sayAt(player, `You just executed room context command '${name}'`);
        },
    },
};

export default r0001;
