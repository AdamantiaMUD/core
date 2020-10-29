/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';

import type {Dirent} from 'fs';

import type Config from '../util/config';

type AreaEntityType = 'items' | 'npcs' | 'quests' | 'rooms';

export class AreaEntitiesLoader {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _area: string;
    private readonly _bundle: string;
    private readonly _entityType: AreaEntityType;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(bundle: string, area: string, entityType: AreaEntityType) {
        this._area = area;
        this._bundle = bundle;
        this._entityType = entityType;
    }

    private static async _loadEntity<T>(filePath: string): Promise<T> {
        const contents: string = await fs.readFile(filePath, 'utf8');

        return JSON.parse(contents) as T;
    }

    public hasEntities(config: Config): boolean {
        const folder = path.join(
            config.getPath('bundles'),
            this._bundle,
            this._area,
            this._entityType
        );

        return fs.existsSync(folder);
    }

    public async loadEntities<T>(config: Config): Promise<{[key: string]: T}> {
        if (!this.hasEntities(config)) {
            return Promise.resolve({});
        }

        const folder = path.join(
            config.getPath('bundles'),
            this._bundle,
            this._area,
            this._entityType
        );

        const entities: {[key: string]: T} = {};

        const files: Dirent[] = await fs.readdir(folder, {withFileTypes: true});

        for (const file of files) {
            if (!file.isDirectory() && path.extname(file.name) === '.json') {
                /* eslint-disable-next-line no-await-in-loop */
                entities[file.name] = await AreaEntitiesLoader._loadEntity(path.join(folder, file.name));
            }
        }

        return entities;
    }
}

export default AreaEntitiesLoader;
