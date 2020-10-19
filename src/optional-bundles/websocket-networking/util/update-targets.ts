import type CharacterInterface from '../../../lib/characters/character-interface';
import type Player from '../../../lib/players/player';

export const updateTargets = (player: Player): void => {
    player.socket?.command(
        'sendData',
        'targets',
        [...player.combat.combatants].map((target: CharacterInterface) => ({
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
