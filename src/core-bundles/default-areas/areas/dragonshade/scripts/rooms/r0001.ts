import {sayAt} from '../../../../../../lib/communication/broadcast';

import type BehaviorDefinition from '../../../../../../lib/behaviors/behavior-definition';
import type MudEventListener from '../../../../../../lib/events/mud-event-listener';
import type Room from '../../../../../../lib/locations/room';
import type {RoomCommandPayload} from '../../../../../../lib/locations/events';

const r0001: BehaviorDefinition = {
    listeners: {
        command: (): MudEventListener<[Room, RoomCommandPayload]> => (
            room: Room,
            {player, name}: RoomCommandPayload
        ): void => {
            if (name !== 'begin') {
                sayAt(player, 'Huh?');

                return;
            }

            sayAt(player, `You just executed room context command '${name}'`);
        },
    },
};

export default r0001;
