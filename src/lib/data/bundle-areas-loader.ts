/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';

import type {Dirent} from 'fs';

import type AreaManifest from '../locations/area-manifest';
import type Config from '../util/config';

export class BundleAreasLoader {
    private readonly _bundle: string;

    public constructor(bundle: string) {
        this._bundle = bundle;
    }

    private static async _loadManifest(manifestPath: string): Promise<AreaManifest> {
        const rawManifest: string = await fs.readFile(manifestPath, 'utf8');

        return JSON.parse(rawManifest) as AreaManifest;
    }

    public hasAreas(config: Config): boolean {
        const folder = path.join(config.getPath('bundles'), this._bundle, 'areas');

        return fs.existsSync(folder);
    }

    public async loadManifests(config: Config): Promise<{[key: string]: AreaManifest}> {
        if (!this.hasAreas(config)) {
            return {};
        }

        const bundleFolder = path.join(config.getPath('bundles'), this._bundle);
        const areasFolder = path.join(bundleFolder, 'areas');

        const files: Dirent[] = await fs.readdir(areasFolder, {withFileTypes: true});

        const areas: {[key: string]: AreaManifest} = {};

        for (const file of files) {
            const manifestPath = path.join(areasFolder, file.name, 'manifest.json');

            if (file.isDirectory() && fs.existsSync(manifestPath)) {
                /* eslint-disable-next-line no-await-in-loop */
                areas[file.name] = await BundleAreasLoader._loadManifest(manifestPath);
            }
        }

        return areas;
    }
}

export default BundleAreasLoader;
