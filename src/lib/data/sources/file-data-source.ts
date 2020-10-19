import path from 'path';

import DataSource from './data-source';
import {hasValue} from '../../util/functions';

import type DataSourceConfig from './data-source-config';

export class FileDataSource extends DataSource {
    /**
     * Parse [ROOT], [DATA], [BUNDLES], [AREA], and [BUNDLE] template in the path
     * @throws Error
     */
    public resolvePath(config: DataSourceConfig): string {
        const {path: filePath, bundle, area} = config;

        if (!hasValue(filePath)) {
            throw new Error('No path for DataSource');
        }

        if (filePath.includes('[AREA]') && !hasValue(area)) {
            throw new Error('No area configured for path with [AREA]');
        }

        if (filePath.includes('[BUNDLE]') && !hasValue(bundle)) {
            throw new Error('No bundle configured for path with [BUNDLE]');
        }

        let safeBundle = bundle,
            bundlesPath = this.appConfig.get<string>('bundlesPath', ''),
            rootPath = this.appConfig.get<string>('rootPath', '');

        if (safeBundle?.startsWith('core.')) {
            bundlesPath = this.appConfig.get('core.bundlesPath');
            rootPath = this.appConfig.get('core.rootPath');
            safeBundle = safeBundle.replace('core.', '');
        }

        return filePath
            .replace('[AREA]', area ?? '')
            .replace('[BUNDLE]', safeBundle ?? '')
            .replace('[BUNDLES]', bundlesPath)
            .replace('[DATA]', this.appConfig.get<string>('dataPath'))
            .replace('[ROOT]', rootPath)
            .replace('/', path.sep);
    }
}

export default FileDataSource;
