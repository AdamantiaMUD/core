/* eslint-disable-next-line id-length */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

import { hasValue, noop } from './functions.js';

let dataPath: string | null = null;

/**
 * Utilities for loading/parsing data files from disk
 */
export const Data = {
    /**
     * Check if a data file exists
     */
    exists: (type: string, id: string): boolean =>
        fs.existsSync(Data.getDataFilePath(type, id)),

    /**
     * get the file path for a given data file by type (player/account)
     * @param {string} type
     * @param {string} id
     * @returns {string}
     */
    getDataFilePath: (type: string, id: string): string => {
        if (!hasValue(dataPath)) {
            throw new Error('dataPath has not been set');
        }

        switch (type) {
            case 'player':
                return path.join(dataPath, 'player', `${id}.json`);

            case 'account':
                return path.join(dataPath, 'account', `${id}.json`);

            /* no default */
        }

        throw new Error(`Invalid data type provided: '${type}'`);
    },

    /**
     * Determine whether or not a path leads to a legitimate JS file or not.
     */
    isScriptFile: (uri: string, file?: string): boolean => {
        const script = hasValue(file) ? file : uri;

        const fileTest = /(?!test\.)[jt]s$/u;

        return fs.statSync(uri).isFile() && fileTest.exec(script) !== null;
    },

    /**
     * load/parse a data file (player/account)
     */
    load: (type: string, id: string): string =>
        Data.parseFile(Data.getDataFilePath(type, id)),

    /**
     * load the MOTD for the intro screen
     * @returns string
     */
    loadMotd: (): string => {
        if (!hasValue(dataPath)) {
            throw new Error('dataPath has not been set');
        }

        return fs.readFileSync(path.join(dataPath, 'motd'), 'utf8');
    },

    /**
     * Read in and parse a file. Current supports yaml and json
     */
    parseFile: <T = unknown>(filepath: string): T => {
        if (!fs.existsSync(filepath)) {
            throw new Error(`File [${filepath}] does not exist!`);
        }

        const contents = fs
            .readFileSync(fs.realpathSync(filepath))
            .toString('utf8');
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const parsers: Record<string, (...args: any[]) => unknown> = {
            '.yml': yaml.load,
            '.yaml': yaml.load,
            '.json': JSON.parse,
        };

        const ext = path.extname(filepath);

        if (ext in parsers) {
            return parsers[ext](contents) as T;
        }

        throw new Error(`File [${filepath}] does not have a valid parser!`);
    },

    /**
     * Save data file (player/account) data to disk
     */
    save: (
        type: string,
        id: string,
        data: unknown,
        callback: () => void = noop
    ): void => {
        fs.writeFileSync(
            Data.getDataFilePath(type, id),
            Data.stringify(data),
            'utf8'
        );

        callback();
    },

    /**
     * Write data to a file
     */
    saveFile: (
        filepath: string,
        data: unknown,
        callback: () => void = noop
    ): void => {
        if (!fs.existsSync(filepath)) {
            throw new Error(`File [${filepath}] does not exist!`);
        }

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const serializers: Record<string, (...args: any[]) => string> = {
            '.yml': yaml.dump,
            '.yaml': yaml.dump,
            '.json': (json: unknown) => Data.stringify(json),
        };

        const ext = path.extname(filepath);

        if (!(ext in serializers)) {
            throw new Error(
                `File [${filepath}] does not have a valid serializer!`
            );
        }

        const dataToWrite = serializers[ext](data);

        fs.writeFileSync(filepath, dataToWrite, 'utf8');

        callback();
    },

    setDataPath: (uri: string): void => {
        dataPath = uri;
    },

    stringify: (data: unknown): string => JSON.stringify(data, null, 4),
};

export default Data;
