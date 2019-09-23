import path from 'path';

import DataSource from './data-source';
import DataSourceConfig from './data-source-config';

export class FileDataSource extends DataSource {
    /**
     * Parse [AREA] and [BUNDLE] template in the path
     * @throws Error
     */
    public resolvePath(config: DataSourceConfig): string {
        const {path: filePath, bundle, area} = config;

        if (!this.root) {
            throw new Error('No root configured for DataSource');
        }

        if (!filePath) {
            throw new Error('No path for DataSource');
        }

        if (filePath.includes('[AREA]') && !area) {
            throw new Error('No area configured for path with [AREA]');
        }

        if (filePath.includes('[BUNDLE]') && !bundle) {
            throw new Error('No bundle configured for path with [BUNDLE]');
        }

        return path
            .join(this.root, filePath)
            .replace('[AREA]', area)
            .replace('[BUNDLE]', bundle);
    }
}

export default FileDataSource;
