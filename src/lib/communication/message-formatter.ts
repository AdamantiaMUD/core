import type Broadcastable from './broadcastable';

export type MessageFormatter = (target: Broadcastable, message: string) => string;

export default MessageFormatter;
