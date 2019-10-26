import Player from '../../../lib/players/player';

export const updateTargets = (player: Player): void => {
    player.socket.command(
        'sendData',
        'targets',
        [...player.combat.combatants].map(target => ({
            name: target.name,
            hp: {
                current: target.getAttribute('hp'),
                max: target.getMaxAttribute('hp'),
            },
        }))
    );
};

export default updateTargets;
