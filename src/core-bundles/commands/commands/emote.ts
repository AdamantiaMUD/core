import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

const findTarget = (player: Player, thingName: string): unknown => {
    const findableThings = new Set([
        ...player.room.players,
        ...player.equipment,
        ...player.room.npcs,
        ...player.room.items,
    ]);

    return ArgParser.parseDot(thingName, findableThings);
};

export const cmd: CommandDefinitionFactory = {
    name: 'emote',
    usage: 'emote <message>',
    aliases: [':', '/me'],
    command: () => (rawArgs: string, player: Player) => {
        const args = rawArgs.trim();

        if (!args.length) {
            sayAt(player, 'Yes, but what do you want to emote?');

            return;
        }

        const FIND_TARGETS_REGEXP = /~((?:\d+\.)?[^\s.,!?"']+)/giu;
        const REPLACE_TARGETS_REGEXP = /~(?:\d+\.)?[^\s.,!?"']+/u;

        // Build an array of items matching the emote targets (specified by ~<target> in the emote.
        const matchedTargets = [];
        let execResult = null;

        while ((execResult = FIND_TARGETS_REGEXP.exec(args)) !== null) {
            const targetNameFromInput = execResult[1];
            const target = findTarget(player, targetNameFromInput);

            if (!target) {
                sayAt(player, `I can not seem to find ${targetNameFromInput}`);

                return;
            }

            matchedTargets.push(target);
        }

        // Replace the initial emote message with the found targets and broadcast to the room.
        const emoteMessage = matchedTargets
            .reduce((string, target) => string.replace(REPLACE_TARGETS_REGEXP, target.name), `${player.name} ${args}`)

            // Enforce punctuation
            .replace(/([^.?!])$/u, '$1.');

        player.room.players.forEach(presentPlayer => {
            if (presentPlayer === player) {
                sayAt(player, `You emote "${emoteMessage}"`);
            }
            else {
                sayAt(presentPlayer, emoteMessage.replace(presentPlayer.name, 'you'));
            }
        });
    },
};

export default cmd;
