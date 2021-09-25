/* eslint-disable-next-line id-length */
const fs = require('fs');
const path = require('path');

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
