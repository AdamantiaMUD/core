import type { TransformableInfo } from 'logform';

export interface LogMessage extends TransformableInfo {
    timestamp: string;
}

export default LogMessage;
