import type Player from '../players/player.js';

export type CommandExecutable =
    ((
        args: string | null,
        player: Player,
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        ...argV: any[]
    ) => void)
    | ((
        args: string | null,
        player: Player,
        alias: string,
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        ...argV: any[]
    ) => void);

export default CommandExecutable;
