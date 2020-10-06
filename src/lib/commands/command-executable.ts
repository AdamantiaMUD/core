import type Player from '../players/player';

export type CommandExecutable = (
    args: string | null,
    player: Player,
    alias?: string,
    ...argV: unknown[]
) => void;

export default CommandExecutable;
