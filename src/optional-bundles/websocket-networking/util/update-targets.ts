import type Character from '../../../lib/characters/character.js';
import type Player from '../../../lib/players/player.js';

export const updateTargets = (player: Player): void => {
    player.socket?.command(
        'sendData',
        'targets',
        [...player.combat.combatants].map((target: Character) => ({
            name: target.name,
            /* eslint-disable-next-line id-length */
            hp: {
                current: target.getAttribute('hp'),
                max: target.getMaxAttribute('hp'),
            },
        }))
    );
};

export default updateTargets;
