/* eslint-disable-next-line id-length */
import fs from 'fs';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

/* eslint-disable-next-line @typescript-eslint/naming-convention, id-match */
const __filename = fileURLToPath(import.meta.url);
/* eslint-disable-next-line @typescript-eslint/naming-convention, id-match */
const __dirname = dirname(__filename);

const motdDestFolder = path.join(
    __dirname,
    '..',
    'build',
    'core-bundles',
    'input-events',
    'resources'
);
const motdDest = path.join(motdDestFolder, 'motd');
const motdSrc = path.join(
    __dirname,
    '..',
    'src',
    'core-bundles',
    'input-events',
    'resources',
    'motd'
);

fs.mkdirSync(motdDestFolder, {recursive: true});
fs.copyFileSync(motdSrc, motdDest);
