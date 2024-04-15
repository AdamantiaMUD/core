import path from 'path';
import {fileURLToPath} from 'url';

import {Config} from '../lib/util/config.js';

import type {MudConfig} from '../lib/util/config.js';

/* eslint-disable-next-line @typescript-eslint/naming-convention, id-match */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serverConfig: MudConfig = {
    bundles: [],
    logfile: 'server.log',
    ports: {
        telnet: 4000,
    },
    paths: {
        data: `${__dirname}/data`,
        bundles: path.join(__dirname, 'bundles'),
        root: __dirname,
    },
    players: {
        startingRoom: 'dragonshade:r0001',
    },
};

const config = new Config();
config.load(serverConfig);
