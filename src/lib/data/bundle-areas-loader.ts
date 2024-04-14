/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';

import type {Dirent} from 'fs';

import type AreaManifest from '../locations/area-manifest';
import type Config from '../util/config';
import BundleObjectLoader from './bundle-object-loader';

export class BundleAreasLoader extends BundleObjectLoader {
    public constructor(bundle: string) {
        super(bundle);
    }

    private static async _loadManifest(manifestPath: string): Promise<AreaManifest> {
        const rawManifest: string = await fs.readFile(manifestPath, 'utf8');

        return JSON.parse(rawManifest) as AreaManifest;
    }

    public hasAreas(config: Config): boolean {
        const folder = path.join(this._getBundleFolder(config), 'areas');

        return fs.existsSync(folder);
    }

    public async loadManifests(config: Config): Promise<Record<string, AreaManifest>> {
        if (!this.hasAreas(config)) {
            return {};
        }

        const bundleFolder = this._getBundleFolder(config);
        const areasFolder = path.join(bundleFolder, 'areas');

        const files: Dirent[] = await fs.readdir(areasFolder, {withFileTypes: true});

        const areas: Record<string, AreaManifest> = {};

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
