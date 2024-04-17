import { CombatInvalidTargetError } from '../../../lib/combat/errors/index.js';
import {
    UpdateTickEvent,
    type UpdateTickPayload,
} from '../../../lib/common/events/index.js';
import Broadcast from '../../../lib/communication/broadcast.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import WebsocketStream from '../../../optional-bundles/websocket-networking/lib/WebsocketStream.js';

const { prompt, sayAt } = Broadcast;

export const evt: MudEventListenerDefinition<[Player, UpdateTickPayload]> = {
    name: UpdateTickEvent.getName(),
    listener:
        (state: GameStateData): MudEventListener<[Player, UpdateTickPayload]> =>
        (player: Player): void => {
            if (!player.combat.isFighting()) {
                return;
            }

            state.combat?.startRegeneration(state, player);

            let hadActions = false;

            try {
                hadActions = state.combat?.updateRound(state, player) ?? false;
            } catch (err: unknown) {
                if (err instanceof CombatInvalidTargetError) {
                    sayAt(player, "You can't attack that target.");
                } else {
                    throw err;
                }
            }

            if (!hadActions) {
                return;
            }

            // @TODO: figure out a better way of determining socket type. Maybe add a `type` field to the TransportSocket class and its subclasses?
            const isUsingWebsockets = player.socket instanceof WebsocketStream;

            // don't show the combat prompt to a websockets server
            if (!player.hasPrompt('combat') && !isUsingWebsockets) {
                player.addPrompt(
                    'combat',
                    () => state.combat?.buildPrompt(player) ?? ''
                );
            }

            sayAt(player, '');
            if (!isUsingWebsockets) {
                prompt(player);
            }
        },
};

export default evt;
