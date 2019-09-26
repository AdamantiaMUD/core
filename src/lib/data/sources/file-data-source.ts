import path from 'path';

import DataSource from './data-source';
import DataSourceConfig from './data-source-config';

export class FileDataSource extends DataSource {
    /**
     * Parse [ROOT], [DATA], [BUNDLES], [AREA], and [BUNDLE] template in the path
     * @throws Error
     */
    public resolvePath(config: DataSourceConfig): string {
        const {path: filePath, bundle, area} = config;

        if (!filePath) {
            throw new Error('No path for DataSource');
        }

        if (filePath.includes('[AREA]') && !area) {
            throw new Error('No area configured for path with [AREA]');
        }

        if (filePath.includes('[BUNDLE]') && !bundle) {
            throw new Error('No bundle configured for path with [BUNDLE]');
        }

        return filePath
            .replace('[AREA]', area)
            .replace('[BUNDLE]', bundle)
            .replace('[BUNDLES]', this.paths.bundles)
            .replace('[DATA]', this.paths.data)
            .replace('[ROOT]', this.paths.root);
    }
}

export default FileDataSource;
