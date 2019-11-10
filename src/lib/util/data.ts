import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

let dataPath: string = null;

/**
 * Class for loading/parsing data files from disk
 */
export class Data {
    /**
     * Check if a data file exists
     */
    public static exists(type: string, id: string): boolean {
        return fs.existsSync(this.getDataFilePath(type, id));
    }

    /**
     * get the file path for a given data file by type (player/account)
     * @param {string} type
     * @param {string} id
     * @return {string}
     */
    public static getDataFilePath(type: string, id: string): string {
        switch (type) {
            case 'player':
                return path.join(dataPath, 'player', `${id}.json`);

            case 'account':
                return path.join(dataPath, 'account', `${id}.json`);

            /* no default */
        }

        throw new Error(`Invalid data type provided: '${type}'`);
    }

    /**
     * Determine whether or not a path leads to a legitimate JS file or not.
     */
    public static isScriptFile(uri: string, file: string): boolean {
        const script = file || uri;

        return fs.statSync(uri).isFile() && script.match(/(?!test\.)[jt]s$/u) !== null;
    }

    /**
     * load/parse a data file (player/account)
     */
    public static load(type: string, id: string): string {
        return this.parseFile(this.getDataFilePath(type, id));
    }

    /**
     * load the MOTD for the intro screen
     * @return string
     */
    public static loadMotd(): string {
        return fs.readFileSync(path.join(dataPath, 'motd'), 'utf8');
    }

    /**
     * Read in and parse a file. Current supports yaml and json
     */
    public static parseFile(filepath: string): string {
        if (!fs.existsSync(filepath)) {
            throw new Error(`File [${filepath}] does not exist!`);
        }

        const contents = fs.readFileSync(fs.realpathSync(filepath)).toString('utf8');
        const parsers = {
            '.yml': yaml.load,
            '.yaml': yaml.load,
            '.json': JSON.parse,
        };

        const ext = path.extname(filepath);

        if (!(ext in parsers)) {
            throw new Error(`File [${filepath}] does not have a valid parser!`);
        }

        return parsers[ext](contents);
    }

    /**
     * Save data file (player/account) data to disk
     */
    public static save(type: string, id: string, data: any, callback: Function = () => {}): void {
        fs.writeFileSync(
            this.getDataFilePath(type, id),
            this.stringify(data),
            'utf8'
        );

        callback();
    }

    /**
     * Write data to a file
     */
    public static saveFile(filepath: string, data: any, callback: Function = () => {}): void {
        if (!fs.existsSync(filepath)) {
            throw new Error(`File [${filepath}] does not exist!`);
        }

        const serializers = {
            '.yml': yaml.safeDump,
            '.yaml': yaml.safeDump,
            '.json': (json: any) => this.stringify(json),
        };

        const ext = path.extname(filepath);

        if (!(ext in serializers)) {
            throw new Error(`File [${filepath}] does not have a valid serializer!`);
        }

        const dataToWrite = serializers[ext](data);

        fs.writeFileSync(filepath, dataToWrite, 'utf8');

        callback();
    }

    public static setDataPath(uri: string): void {
        dataPath = uri;
    }

    public static stringify(data: any): string {
        return JSON.stringify(data, null, 4);
    }
}

export default Data;
