import path from 'path';
import { fileURLToPath } from 'url';

import type Config from '../util/config.js';

/* eslint-disable-next-line @typescript-eslint/naming-convention, id-match */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export abstract class BundleObjectLoader {
    protected readonly _bundle: string;

    public constructor(bundle: string) {
        this._bundle = bundle;
    }

    protected _getBundleFolder(config: Config): string {
        if (this._bundle.startsWith('core.')) {
            return path.join(
                __dirname,
                '..',
                '..',
                'core-bundles',
                this._bundle.replace('core.', '')
            );
        }

        if (this._bundle.startsWith('adamantia.')) {
            return path.join(
                __dirname,
                '..',
                '..',
                'optional-bundles',
                this._bundle.replace('adamantia.', '')
            );
        }
        return path.join(config.getPath('bundles'), this._bundle);
    }
}

export default BundleObjectLoader;
