import path from 'path';

import {Config} from '../lib/util/config';

import type {MudConfig} from '../lib/util/config';

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
